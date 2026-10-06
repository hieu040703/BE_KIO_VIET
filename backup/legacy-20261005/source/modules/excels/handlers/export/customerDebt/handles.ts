import dayjs from "dayjs";
import Excel from "exceljs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import { inject, injectable } from "inversify";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { header } from "./header";
import { NotFoundError } from "@/shared/types/errors";
import { ExcelUtils } from "@/shared/utils/excel/excels.utils";
import { Request } from "express";
import { CustomerDebtExportDto, DataDebtDto } from "./validate";
import { DEBT_TYPES } from "@/modules/accountant/debt/debt.types";
import { DebtRepository } from "@/modules/accountant/debt/debt.repository";
import { Finance } from "@/database/models/Finance";
import { DebtTypeEnum, FinanceTypeEnum } from "@/shared/constants/constance";
import { Debt } from "@/database/models/Debt";

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

@injectable()
export class ExportCustomerDebtHandler {
  constructor(@inject(DEBT_TYPES.DebtRepository) private debtRepository: DebtRepository) {}

  async handle(data: CustomerDebtExportDto, req?: Request, manager?: IEntityManager): Promise<ApiResponse<any>> {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Dữ liệu thu chi");

    let dataRender: DataDebtDto[] = [];

    // Lấy dữ liệu công nợ khách hàng từ Debt
    const debt = await this.debtRepository.getDebtByCustomerId(data.customerId, data, manager);

    if (!debt) {
      throw new NotFoundError("Không có dữ liệu công nợ cho khách hàng này");
    }

    console.log(debt);

    dataRender = debt.details.map((item: Finance | Debt) => {
      let address = "";
      if ("order" in item && item.order && item.order.address) {
        const orderAddress = item.order.address;
        if (orderAddress.detail) address += orderAddress.detail + " ";
        if (orderAddress.ward) address += orderAddress.ward + " ";
        if (orderAddress.state) address += orderAddress.state;
      }

      return {
        timeAt: item.timeAt,
        orderCode: item.order ? item.order.code : null,
        content: item.order ? item.order.description : null,
        amount: item.type === DebtTypeEnum.RECEIVABLE ? item.amount : null,
        payment: item.type === FinanceTypeEnum.INCOME ? item.amount : null,
        remainingDebt: item.remainingDebt,
        address: address,
        customRowStyle: undefined,
      };
    });

    dataRender.unshift({
      timeAt: "Số dư đầu kỳ",
      orderCode: null,
      content: null,
      amount: null,
      payment: null,
      remainingDebt: debt.beginningDebt,
      address: null,
      customRowStyle: {
        font: { bold: true, color: { argb: "000000" }, size: 12 },
        numFmt: "#,##0",
      },
    });

    dataRender.push({
      timeAt: "Tổng cộng",
      orderCode: null,
      content: null,
      amount: debt.debtIncrease,
      payment: debt.debtDecrease,
      remainingDebt: null,
      address: null,
      customRowStyle: {
        font: { bold: true, color: { argb: "000000" }, size: 12 },
        numFmt: "#,##0",
      },
    });

    dataRender.push({
      timeAt: "Số dư cuối kỳ",
      orderCode: null,
      content: null,
      amount: null,
      payment: null,
      remainingDebt: debt.endingDebt,
      address: null,
      customRowStyle: {
        font: { bold: true, color: { argb: "000000" }, size: 12 },
        numFmt: "#,##0",
      },
    });

    worksheet.mergeCells("A2", "G2");
    worksheet.getRow(2).height = 40;
    worksheet.getCell("A2").value = `ĐỐI SOÁT CÔNG NỢ KHÁCH HÀNG`;
    worksheet.getCell("A2").font = { size: 18, bold: true };
    worksheet.getCell("A2").alignment = { vertical: "middle", horizontal: "center" };

    worksheet.getCell("A3").value = `Khách hàng:`;
    worksheet.mergeCells("B3", "E3");
    worksheet.getCell("B3").value = debt.name ? debt.name : "N/A";
    worksheet.getCell("A3").font = { size: 12, bold: true };
    worksheet.getCell("B3").font = { size: 12 };
    worksheet.getCell("A3").alignment = { vertical: "middle", horizontal: "right" };
    worksheet.getCell("B3").alignment = { vertical: "middle", horizontal: "left" };

    worksheet.getCell("F3").value = `Ngày:`;
    worksheet.getCell("F3").font = { size: 12, bold: true };
    worksheet.getCell("F3").alignment = { vertical: "middle", horizontal: "right" };

    const currentDate = dayjs().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
    worksheet.getCell("G3").value = currentDate;
    worksheet.getCell("G3").font = { size: 12 };
    worksheet.getCell("G3").alignment = { vertical: "middle", horizontal: "left" };

    // render dòng địa chỉ

    ExcelUtils.renderExcelHeader({
      worksheet,
      headerData: header,
      startRow: 5,
      startCol: 1,
      dataRender: dataRender,
    });

    const filePath = `uploads/temp/Bao-Cao-Cong-No-Khach-Hang-${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(filePath);

    return ApiResponseHandler.createSuccess("OK", { path: filePath });
  }
}
