import { injectable, inject } from "inversify";
import { FinanceService } from "./finance.service";
import { FINANCE_TYPES } from "./finance.types";
import { BaseController } from "@/shared/base/BaseController";
import { COMMON_TYPES } from "@/modules/common/common.types";
import { TransactionManager } from "@/shared/base/TransactionManager";
import { Request, Response } from "express";

@injectable()
export class FinanceController extends BaseController<FinanceService> {
  constructor(
    @inject(FINANCE_TYPES.FinanceService) protected service: FinanceService,
    @inject(COMMON_TYPES.TransactionManager) protected transactionManager: TransactionManager,
  ) {
    super(service);
  }

  create = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      // Hoặc nếu muốn quản lý transaction từ controller
      const result = await this.transactionManager.withTransaction(async (tx) => {
        return await this.service.create(req.body, req, tx.manager);
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: (err?: any) => void) => {
    try {
      // Hoặc nếu muốn quản lý transaction từ controller
      const result = await this.transactionManager.withTransaction(async (tx) => {
        const id = req.params.id as string;
        return await this.service.delete(id, req, tx.manager);
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
