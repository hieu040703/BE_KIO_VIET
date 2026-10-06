import { COMMON_TYPES } from "@/modules/common/common.types";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { ApiResponse } from "@/shared/types/interfaces";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { inject, injectable } from "inversify";
import Excel from "exceljs";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { header } from "./header";
import { ImportOrderExcelDto } from "@/modules/excels/excels.validator";

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

@injectable()
export class TemplateOrderHandler {
  constructor(@inject(COMMON_TYPES.TransactionManager) private transactionManager: TransactionManager) {}

  async handle(numberOfRows: number): Promise<ApiResponse<any>> {
    return await this.transactionManager.withTransaction(async (tx) => {
      const path = `uploads/temp/file-${dayjs().tz("Asia/Bangkok").format("YYYYMMDD")}-${Date.now()}.xlsx`;

      // Sử dụng Stream WorkbookWriter để xử lý file lớn
      const workbook = new Excel.stream.xlsx.WorkbookWriter({
        filename: path,
        useStyles: true,
        useSharedStrings: true,
      });

      const worksheet = workbook.addWorksheet("data");

      // Render header
      this.renderHeaderStream(worksheet);

      // Process data in batches để tránh memory overflow
      const BATCH_SIZE = 10000;
      const totalBatches = Math.ceil(numberOfRows / BATCH_SIZE);

      console.log(`Starting to generate ${numberOfRows} rows in ${totalBatches} batches...`);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startRow = batchIndex * BATCH_SIZE + 1;
        const endRow = Math.min((batchIndex + 1) * BATCH_SIZE, numberOfRows);

        console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (rows ${startRow}-${endRow})...`);

        // Generate và write từng row trong batch
        for (let i = startRow; i <= endRow; i++) {
          // const rowData = this.generateRowData(i);
          // const row = worksheet.addRow(this.convertDataToRowValues(rowData));
          // row.commit(); // Commit row để giải phóng bộ nhớ
        }

        // Periodic progress log
        const progress = (((batchIndex + 1) / totalBatches) * 100).toFixed(2);
        console.log(`Progress: ${progress}% completed`);

        // Allow event loop to process để không block
        await new Promise((resolve) => setImmediate(resolve));
      }

      // Commit worksheet và workbook
      worksheet.commit();
      await workbook.commit();

      console.log(`File generated successfully: ${path}`);

      return ApiResponseHandler.createSuccess("OK", path);
    });
  }

  /**
   * Render header cho stream worksheet
   */
  private renderHeaderStream(worksheet: Excel.Worksheet): void {
    // Set column widths và keys
    const columns = header.map((h) => ({
      header: h.header,
      key: h.key,
      width: h.width,
      style: h.style,
    }));

    worksheet.columns = columns;

    // Apply styles to header row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell, colNumber) => {
      const headerConfig = header[colNumber - 1];
      if (headerConfig && headerConfig.style) {
        cell.style = headerConfig.style as any;
      }
    });
    headerRow.commit();
  }

  /**
   * Convert data object thành array values theo thứ tự của header
   */
  private convertDataToRowValues(data: ImportOrderExcelDto): any[] {
    return [
      data.code,
      data.shopName,
      data.phone,
      data.timeAt,
      data.cod,
      data.originalCod,
      data.weight,
      data.shippingFee,
      data.itemPrice,
      data.description,
      data.receiverName,
      "", // customerName - empty for template
      data.shippingPostOffice,
    ];
  }
}
