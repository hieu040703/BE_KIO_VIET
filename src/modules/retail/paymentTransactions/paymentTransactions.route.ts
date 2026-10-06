import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPaymentTransactionsController } from "./paymentTransactions.controller";
import { RETAIL_PAYMENT_TRANSACTIONS_TYPES } from "./paymentTransactions.types";
import { paymentTransactionsBodySchema, paymentTransactionsIdParamsSchema, paymentTransactionsQuerySchema } from "./paymentTransactions.validator";

@injectable()
export class RetailPaymentTransactionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PAYMENT_TRANSACTIONS_TYPES.Controller) private paymentTransactionsController: RetailPaymentTransactionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "payment-transactions": ["read"] }),
      zodValidate(paymentTransactionsQuerySchema, "query"),
      this.paymentTransactionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "payment-transactions": ["create"] }),
      zodValidate(paymentTransactionsBodySchema, "body"),
      this.paymentTransactionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "payment-transactions": ["read"] }),
      zodValidate(paymentTransactionsIdParamsSchema, "params"),
      this.paymentTransactionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "payment-transactions": ["update"] }),
      zodValidate(paymentTransactionsIdParamsSchema, "params"),
      zodValidate(paymentTransactionsBodySchema, "body"),
      this.paymentTransactionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "payment-transactions": ["delete"] }),
      zodValidate(paymentTransactionsIdParamsSchema, "params"),
      this.paymentTransactionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
