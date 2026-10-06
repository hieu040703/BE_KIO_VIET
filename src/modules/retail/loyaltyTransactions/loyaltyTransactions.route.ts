import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailLoyaltyTransactionsController } from "./loyaltyTransactions.controller";
import { RETAIL_LOYALTY_TRANSACTIONS_TYPES } from "./loyaltyTransactions.types";
import { loyaltyTransactionsBodySchema, loyaltyTransactionsIdParamsSchema, loyaltyTransactionsQuerySchema } from "./loyaltyTransactions.validator";

@injectable()
export class RetailLoyaltyTransactionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_LOYALTY_TRANSACTIONS_TYPES.Controller) private loyaltyTransactionsController: RetailLoyaltyTransactionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "loyalty-transactions": ["read"] }),
      zodValidate(loyaltyTransactionsQuerySchema, "query"),
      this.loyaltyTransactionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "loyalty-transactions": ["create"] }),
      zodValidate(loyaltyTransactionsBodySchema, "body"),
      this.loyaltyTransactionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "loyalty-transactions": ["read"] }),
      zodValidate(loyaltyTransactionsIdParamsSchema, "params"),
      this.loyaltyTransactionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "loyalty-transactions": ["update"] }),
      zodValidate(loyaltyTransactionsIdParamsSchema, "params"),
      zodValidate(loyaltyTransactionsBodySchema, "body"),
      this.loyaltyTransactionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "loyalty-transactions": ["delete"] }),
      zodValidate(loyaltyTransactionsIdParamsSchema, "params"),
      this.loyaltyTransactionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
