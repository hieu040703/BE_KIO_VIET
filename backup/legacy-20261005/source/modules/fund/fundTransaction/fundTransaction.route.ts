import { Router } from "express";
import { injectable, inject } from "inversify";
import { FundTransactionController } from "./fundTransaction.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateFundTransactionSchema,
  UpdateFundTransactionSchema,
  FundTransactionQuerySchema,
  FundTransactionParamsSchema,
} from "./fundTransaction.validator";
import { FUND_TRANSACTION_TYPES } from "./fundTransaction.types";

@injectable()
export class FundTransactionRouter {
  private router: Router;

  constructor(
    @inject(FUND_TRANSACTION_TYPES.FundTransactionController)
    private fundTransactionController: FundTransactionController,
  ) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All fundTransaction routes require authentication
    // this.router.use(authenticate);

    // GET /fundTransactions - Get all fundTransactions with filters
    this.router.get(
      "/",
      zodValidate(FundTransactionQuerySchema, "query"),
      this.fundTransactionController.getAllWithPagination,
    );

    // POST /fundTransactions - Create new fundTransaction
    this.router.post("/", zodValidate(CreateFundTransactionSchema, "body"), this.fundTransactionController.create);

    // GET /fundTransactions/:id - Get fundTransaction by ID
    this.router.get("/:id", zodValidate(FundTransactionParamsSchema, "params"), this.fundTransactionController.getById);

    // PUT /fundTransactions/:id - Update fundTransaction
    this.router.put(
      "/:id",
      zodValidate(FundTransactionParamsSchema, "params"),
      zodValidate(UpdateFundTransactionSchema, "body"),
      this.fundTransactionController.update,
    );

    // DELETE /fundTransactions/:id - Delete fundTransaction
    this.router.delete(
      "/:id",
      zodValidate(FundTransactionParamsSchema, "params"),
      this.fundTransactionController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
