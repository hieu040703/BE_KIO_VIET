import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailVoucherTransactionsController } from "./voucherTransactions.controller";
import { RETAIL_VOUCHER_TRANSACTIONS_TYPES } from "./voucherTransactions.types";
import { voucherTransactionsBodySchema, voucherTransactionsIdParamsSchema, voucherTransactionsQuerySchema } from "./voucherTransactions.validator";

@injectable()
export class RetailVoucherTransactionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_VOUCHER_TRANSACTIONS_TYPES.Controller) private voucherTransactionsController: RetailVoucherTransactionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "voucher-transactions": ["read"] }),
      zodValidate(voucherTransactionsQuerySchema, "query"),
      this.voucherTransactionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "voucher-transactions": ["create"] }),
      zodValidate(voucherTransactionsBodySchema, "body"),
      this.voucherTransactionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "voucher-transactions": ["read"] }),
      zodValidate(voucherTransactionsIdParamsSchema, "params"),
      this.voucherTransactionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "voucher-transactions": ["update"] }),
      zodValidate(voucherTransactionsIdParamsSchema, "params"),
      zodValidate(voucherTransactionsBodySchema, "body"),
      this.voucherTransactionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "voucher-transactions": ["delete"] }),
      zodValidate(voucherTransactionsIdParamsSchema, "params"),
      this.voucherTransactionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
