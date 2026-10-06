import { Router } from "express";
import { inject, injectable } from "inversify";
import { ExcelController } from "./excels.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { EXCELS_TYPES } from "./excels.type";
import { CreateExpenseApprovalRequestSchema } from "../accountant/expenseApproval/expenseApproval.validator";
import { CustomerDebtExportSchema } from "./handlers/export/customerDebt/validate";
import { ExportEmployeeHrSchema } from "./excels.validator";
import { ExportFinanceSchema } from "./handlers/export/finance/validate";

@injectable()
export class ExcelRouter {
  private router: Router;

  constructor(@inject(EXCELS_TYPES.ExcelController) private controller: ExcelController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/template/order", this.controller.exportTemplateOrder);
    this.router.get("/export", this.controller.importOrderExcel);

    // EXPORT
    this.router.post(
      "/export/expense-approval",
      zodValidate(CreateExpenseApprovalRequestSchema, "body"),
      this.controller.exportExpenseApprovalToExcel,
    );

    this.router.post(
      "/export/customer-debt",
      zodValidate(CustomerDebtExportSchema, "body"),
      this.controller.exportCustomerDebtToExcel,
    );

    this.router.post(
      "/export/employee-hr",
      zodValidate(ExportEmployeeHrSchema, "body"),
      this.controller.exportEmployeeHrToExcel,
    );

    this.router.post(
      "/export/finance",
      zodValidate(ExportFinanceSchema, "body"),
      this.controller.exportFinanceToExcel,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
