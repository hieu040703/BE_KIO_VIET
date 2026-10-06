import { injectable, inject } from "inversify";
import { ExpenseApprovalService } from "./expenseApproval.service";
import { EXPENSE_APPROVAL_TYPES } from "./expenseApproval.types";
import { BaseController } from "@/shared/base/BaseController";
import { Request, Response } from "express";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { FinanceTypeEnum } from "@/shared/constants/constance";
import { ExpenseApprovalQueryDto } from "./expenseApproval.validator";

@injectable()
export class ExpenseApprovalController extends BaseController<ExpenseApprovalService> {
  constructor(
    @inject(EXPENSE_APPROVAL_TYPES.ExpenseApprovalService) protected service: ExpenseApprovalService,
    @inject(COMMON_TYPES.TransactionManager) protected transactionManager: TransactionManager,
  ) {
    super(service);
  }

  getAllExpenses = async (req: Request, res: Response, next: Function) => {
    try {
      const result = await this.service.getAllExpenses(req.query as unknown as ExpenseApprovalQueryDto, req);
      res.status(200).json(result);
    } catch (error) {
      console.log("Error in getAllExpenses:", error);
      next(error);
    }
  };

  getExpenseApprovalById = async (req: Request, res: Response, next: Function) => {
    try {
      const result = await this.service.getExpenseApprovalById(req.params.id as string, req);
      res.status(200).json(result);
    } catch (error) {
      console.log("Error in getExpenseApprovalById:", error);
      next(error);
    }
  };

  confirmExpenseApproval = async (req: Request, res: Response, next: Function) => {
    try {
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.confirmExpenseApproval(req.body, req, tx.manager);
      });
      res.status(200).json(result);
    } catch (error) {
      console.log("Error in confirmExpenseApproval:", error);
      next(error);
    }
  };

  rejectExpenseApproval = async (req: Request, res: Response, next: Function) => {
    try {
      const result = await this.service.rejectExpenseApproval(req.params.id as string, req);
      res.status(200).json(result);
    } catch (error) {
      console.log("Error in rejectExpenseApproval:", error);
      next(error);
    }
  };

  deleteItemFromExpenseApproval = async (req: Request, res: Response, next: Function) => {
    try {
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.deleteItemFromExpenseApproval(
          req.params.id as string,
          req.params.type as FinanceTypeEnum,
          req,
          tx.manager,
        );
      });
      res.status(200).json(result);
    } catch (error) {
      console.log("Error in deleteItemFromExpenseApproval:", error);
      next(error);
    }
  };
}
