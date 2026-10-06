import { inject, injectable } from "inversify";
import { EXCELS_TYPES } from "./excels.type";
import { TemplateOrderHandler } from "./handlers/templates/order/handles";
import { ImportOrderHandler } from "./handlers/import/order/handles";
import { ExportDebtHandler } from "./handlers/export/expenseApproval/handles";
import { IEntityManager } from "@/shared/types/interfaces";
import { CreateExpenseApprovalRequestDto } from "../accountant/expenseApproval/expenseApproval.validator";
import { Request } from "express";
import { ExportCustomerDebtHandler } from "./handlers/export/customerDebt/handles";
import { CustomerDebtExportDto } from "./handlers/export/customerDebt/validate";
import { ExportEmployeeHrDto } from "./excels.validator";
import { ExportEmployeeHrHandler } from "./handlers/export/employeeHR/handles";
import { ExportFinanceHandler } from "./handlers/export/finance/handles";
import { ExportFinanceDto } from "./handlers/export/finance/validate";

@injectable()
export class ExcelService {
  constructor(
    @inject(EXCELS_TYPES.TemplateOrderHandler) private templateOrderHandler: TemplateOrderHandler,
    @inject(EXCELS_TYPES.ImportOrderHandler) private importOrderHandler: ImportOrderHandler,

    // EXPORT
    @inject(EXCELS_TYPES.ExportDebtHandler) private exportDebtHandler: ExportDebtHandler,
    @inject(EXCELS_TYPES.ExportCustomerDebtHandler) private exportCustomerDebtHandler: ExportCustomerDebtHandler,
    @inject(EXCELS_TYPES.ExportEmployeeHrHandler) private exportEmployeeHrHandler: ExportEmployeeHrHandler,
    @inject(EXCELS_TYPES.ExportFinanceHandler) private exportFinanceHandler: ExportFinanceHandler,
  ) { }

  //# IMPORT
  async importProfilesFromExcel(path: string) {
    // return await this.importProfileHandler.handle(path);
  }

  async importOrdersFromExcel(path: string) {
    return await this.importOrderHandler.handle(path);
  }

  //# EXPORT
  async exportExpenseApprovalToExcel(data: CreateExpenseApprovalRequestDto, req?: Request, manager?: IEntityManager) {
    return await this.exportDebtHandler.handle(data, req, manager);
  }

  async exportCustomerDebtToExcel(data: CustomerDebtExportDto, req?: Request, manager?: IEntityManager) {
    return await this.exportCustomerDebtHandler.handle(data, req, manager);
  }

  async exportEmployeeHrToExcel(data: ExportEmployeeHrDto, req?: Request, manager?: IEntityManager) {
    return await this.exportEmployeeHrHandler.handle(data, req, manager);
  }

  async exportFinanceToExcel(data: ExportFinanceDto, req?: Request, manager?: IEntityManager) {
    return await this.exportFinanceHandler.handle(data, req, manager);
  }

  //# TEMPLATE
  async createTemplateOrderFromExcel(numberOfRows: number) {
    return await this.templateOrderHandler.handle(numberOfRows);
  }
}
