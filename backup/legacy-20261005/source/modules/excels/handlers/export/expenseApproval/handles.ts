import dayjs from "dayjs";
import Excel from "exceljs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ApiResponse, IEntityManager } from "@/shared/types/interfaces";
import { inject, injectable } from "inversify";
import { ApiResponseHandler } from "@/shared/utils/response.utils";
import { header } from "./header";
import { NotFoundError } from "@/shared/types/errors";
import {
  ExpenseApprovalStatusEnum,
  FinanceTypeEnum,
  MarginStatusEnum,
  TransactionTypeEnum,
} from "@/shared/constants/constance";
import { ExcelUtils } from "@/shared/utils/excel/excels.utils";
import { FINANCE_TYPES } from "@/modules/accountant/finance/finance.types";
import { FinanceService } from "@/modules/accountant/finance/finance.service";
import { CreateExpenseApprovalRequestDto } from "@/modules/accountant/expenseApproval/expenseApproval.validator";
import { Request } from "express";
import { DataExpenseApprovalDto } from "./validate";
import { AdvanceEmployeeRepository } from "@/modules/accountant/advanceEmployee/advanceEmployee.repository";
import { ADVANCE_EMPLOYEE_TYPES } from "@/modules/accountant/advanceEmployee/advanceEmployee.types";
import { AdvanceSalaryRepository } from "@/modules/accountant/advanceSalary/advanceSalary.repository";
import { ADVANCE_SALARY_TYPES } from "@/modules/accountant/advanceSalary/advanceSalary.types";
import { FinanceRepository } from "@/modules/accountant/finance/finance.repository";
import { MarginRepository } from "@/modules/accountant/margin/margin.repository";
import { MARGIN_TYPES } from "@/modules/accountant/margin/margin.types";
import { In } from "typeorm";

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

@injectable()
export class ExportDebtHandler {
  constructor(
    @inject(FINANCE_TYPES.FinanceRepository) private financeRepository: FinanceRepository,
    @inject(ADVANCE_EMPLOYEE_TYPES.AdvanceEmployeeRepository)
    private advanceEmployeeRepository: AdvanceEmployeeRepository,
    @inject(ADVANCE_SALARY_TYPES.AdvanceSalaryRepository) private advanceSalaryRepository: AdvanceSalaryRepository,
    @inject(MARGIN_TYPES.MarginRepository) private marginRepository: MarginRepository,
  ) {}

  async handle(
    data: CreateExpenseApprovalRequestDto,
    req?: Request,
    manager?: IEntityManager,
  ): Promise<ApiResponse<any>> {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Dữ liệu thu chi");

    let dataRender: DataExpenseApprovalDto[] = [];
    let totalAmount = 0;

    if (data.salaryIds && data.salaryIds.length > 0) {
      const salaries = await this.financeRepository.findByOptions(
        {
          where: {
            id: In(data.salaryIds),
            type: FinanceTypeEnum.SALARY,
            status: ExpenseApprovalStatusEnum.PENDING,
          },
        },
        manager,
      );

      for (const item of salaries) {
        dataRender.push({
          timeAt: item.timeAt,
          code: item.code,
          branchName: item.branch?.name || "",
          employeeName: item.employee?.name || "",
          amount: item.amount,
          description: item.note || "",
          type: "Chi lương",
        });

        totalAmount += item.amount;
      }
    }

    if (data.expenseIds && data.expenseIds.length > 0) {
      const expenses = await this.financeRepository.findByOptions(
        {
          where: {
            id: In(data.expenseIds),
            type: FinanceTypeEnum.EXPENSE,
            status: ExpenseApprovalStatusEnum.PENDING,
          },
        },
        manager,
      );

      for (const item of expenses) {
        dataRender.push({
          timeAt: item.timeAt,
          code: item.code,
          branchName: item.branch?.name || "",
          employeeName: item.employee?.name || "",
          amount: item.amount,
          description: item.note || "",
          type: "Chi khác",
        });

        totalAmount += item.amount;
      }
    }

    if (data.advanceEmployeeIds && data.advanceEmployeeIds.length > 0) {
      const advanceEmployees = await this.advanceEmployeeRepository.findByOptions(
        {
          where: { id: In(data.advanceEmployeeIds), status: ExpenseApprovalStatusEnum.PENDING },
        },
        manager,
      );

      for (const item of advanceEmployees) {
        dataRender.push({
          timeAt: item.timeAt,
          code: item.code,
          branchName: item.branch?.name || "",
          employeeName: item.employee?.name || "",
          amount: item.amount,
          description: item.note || "",
          type: "Tạm ứng nhân viên",
        });

        totalAmount += item.amount;
      }
    }

    if (data.advanceSalaryIds && data.advanceSalaryIds.length > 0) {
      const advanceSalaries = await this.advanceSalaryRepository.findByOptions(
        {
          where: { id: In(data.advanceSalaryIds), status: ExpenseApprovalStatusEnum.PENDING },
        },
        manager,
      );

      for (const item of advanceSalaries) {
        dataRender.push({
          timeAt: item.timeAt,
          code: item.code,
          branchName: item.branch?.name || "",
          employeeName: item.employee?.name || "",
          amount: item.amount,
          description: item.note || "",
          type: "Tạm ứng lương",
        });

        totalAmount += item.amount;
      }
    }

    // if (data.marginIds && data.marginIds.length > 0) {
    //   const margins = await this.marginRepository.findByOptions(
    //     {
    //       where: { id: In(data.marginIds), status: MarginStatusEnum.REQUEST_REFUND },
    //     },
    //     manager,
    //   );
    //   for (const item of margins) {
    //     dataRender.push({
    //       timeAt: item.timeAt,
    //       code: item.code,
    //       branchName: item.branch?.name || "",
    //       employeeName: item.employee?.name || "",
    //       amount: item.amount,
    //       description: item.note || "",
    //       type: "Hoàn ứng ký quỹ",
    //     });

    //     totalAmount += item.amount;
    //   }
    // }

    dataRender.push({
      timeAt: null,
      code: "Tổng cộng",
      branchName: "",
      employeeName: "",
      amount: totalAmount,
      description: "",
      type: "",
      customRowStyle: {
        font: { bold: true, color: { argb: "F20000" }, size: 14 },
        numFmt: "#,##0",
      },
    });

    worksheet.mergeCells("A2", "G2");
    worksheet.getRow(2).height = 30;
    worksheet.getCell("A2").value = `BÁO CÁO CHI PHÍ`;
    worksheet.getCell("A2").font = { size: 18, bold: true };
    worksheet.getCell("A2").alignment = { vertical: "middle", horizontal: "center" };

    ExcelUtils.renderExcelHeader({
      worksheet,
      headerData: header,
      startRow: 4,
      startCol: 1,
      dataRender: dataRender,
    });

    const filePath = `uploads/temp/Bao-Cao-Chi-Phi-${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(filePath);

    return ApiResponseHandler.createSuccess("OK", { path: filePath });
  }
}
