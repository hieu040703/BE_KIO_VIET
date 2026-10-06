import { Router } from "express";
import { injectable, inject } from "inversify";
import { ExpenseApprovalController } from "./expenseApproval.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateExpenseApprovalSchema,
  UpdateExpenseApprovalSchema,
  ExpenseApprovalQuerySchema,
  ExpenseApprovalParamsSchema,
  CreateExpenseApprovalRequestSchema,
} from "./expenseApproval.validator";
import { EXPENSE_APPROVAL_TYPES } from "./expenseApproval.types";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { FinanceTypeEnum } from "@/shared/constants/constance";
import { PermissionStructure } from "@/database/models/PermissionGroup";

const approvalPermission =
  (permission: "read" | "create" | "update" | "delete") =>
  (req: any): PermissionStructure => {
    const direction = String(req.query?.direction || req.body?.direction || req.params?.type || "");
    const module = direction === FinanceTypeEnum.INCOME ? "financeIncomeConfirm" : "financeExpenseConfirm";
    return { [module]: [permission] } as PermissionStructure;
  };

@injectable()
export class ExpenseApprovalRouter {
  private router: Router;

  constructor(
    @inject(EXPENSE_APPROVAL_TYPES.ExpenseApprovalController)
    private expenseApprovalController: ExpenseApprovalController,
  ) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /expenseApprovals/get-data - Get pending approval data
    this.router.get(
      "/get-data",
      // permissionMiddleware(approvalPermission("read")),
      zodValidate(ExpenseApprovalQuerySchema, "query"),
      this.expenseApprovalController.getAllExpenses.bind(this.expenseApprovalController),
    );

    this.router.get(
      "/",
      permissionMiddleware(approvalPermission("read")),
      zodValidate(ExpenseApprovalQuerySchema, "query"),
      this.expenseApprovalController.getAllExpenses.bind(this.expenseApprovalController),
    );

    // POST /expenseApprovals - Create new expenseApproval
    this.router.post(
      "/",
      permissionMiddleware(approvalPermission("create")),
      zodValidate(CreateExpenseApprovalRequestSchema, "body"),
      this.expenseApprovalController.confirmExpenseApproval.bind(this.expenseApprovalController),
    );

    // GET /expenseApprovals/:id - Get expenseApproval by ID
    this.router.get(
      "/:id",
      permissionMiddleware(approvalPermission("read")),
      zodValidate(ExpenseApprovalParamsSchema, "params"),
      this.expenseApprovalController.getExpenseApprovalById.bind(this.expenseApprovalController),
    );

    // PUT /expenseApprovals/:id - Update expenseApproval
    this.router.put(
      "/:id",
      permissionMiddleware(approvalPermission("update")),
      zodValidate(ExpenseApprovalParamsSchema, "params"),
      zodValidate(UpdateExpenseApprovalSchema, "body"),
      this.expenseApprovalController.update.bind(this.expenseApprovalController),
    );

    // DELETE /expenseApprovals/:id - Delete expenseApproval
    this.router.delete(
      "/:id/:type",
      permissionMiddleware(approvalPermission("delete")),
      this.expenseApprovalController.deleteItemFromExpenseApproval.bind(this.expenseApprovalController),
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
