import dayjs from "dayjs";
import Excel from "exceljs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import { inject, injectable } from "inversify";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { header } from "./header";
import { ExcelUtils } from "@/shared/utils/excel/excels.utils";
import { Request } from "express";
import { DataFinanceDto } from "./validate";
import { ExportEmployeeHrDto } from "@/modules/excels/excels.validator";
import { FINANCE_TYPES } from "@/modules/accountant/finance/finance.types";
import { FinanceService } from "@/modules/accountant/finance/finance.service";

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

@injectable()
export class ExportFinanceHandler {
  constructor(@inject(FINANCE_TYPES.FinanceService) private financeService: FinanceService) {}

  async handle(data: ExportEmployeeHrDto, req?: Request, manager?: IEntityManager): Promise<ApiResponse<any>> {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Dữ liệu thu chi");

    let dataRender: DataFinanceDto[] = [];

    const finances = await this.financeService.findAllWithPagination(data, req, manager);

    for (let i = 0; i < finances.data.length; i++) {
      const finance = finances.data[i];

      dataRender.push({
        index: i + 1,
        timeAt: finance.timeAt,
        code: finance.code,
        amount: finance.amount,
        note: finance.note || "",
        category: finance.category || "",
        employeeName: finance.employee?.name || "",
        branchName: finance.branch?.name || "",
        customerName: finance.customer?.name || "",
        contractNumber: finance.order?.code || "",
      });
    }

    worksheet.mergeCells("A2", "I2");
    worksheet.getRow(2).height = 40;
    worksheet.getCell("A2").value = `BÁO CÁO THU CHI`;
    worksheet.getCell("A2").font = { size: 18, bold: true };
    worksheet.getCell("A2").alignment = { vertical: "middle", horizontal: "center" };

    if (data.startAt && data.endAt) {
      worksheet.getCell("A3").value = `Ngày:`;
      worksheet.getCell("A3").font = { size: 12, bold: false };
      worksheet.getCell("A3").alignment = { vertical: "middle", horizontal: "right" };

      worksheet.mergeCells("B3", "F3");
      worksheet.getCell("B3").value =
        `${dayjs(data.startAt).format("DD/MM/YYYY")} - ${dayjs(data.endAt).format("DD/MM/YYYY")}`;
      worksheet.getCell("B3").font = { size: 12, bold: false };
      worksheet.getCell("B3").alignment = { vertical: "middle", horizontal: "left" };
    }

    ExcelUtils.renderExcelHeader({
      worksheet,
      headerData: header,
      startRow: 4,
      startCol: 1,
      dataRender: dataRender,
    });

    const filePath = `uploads/temp/Bao-Cao-Thu-Chi-${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(filePath);

    return ApiResponseHandler.createSuccess("OK", { path: filePath });
  }
}
