import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailGiftCardTransactionsController } from "./giftCardTransactions.controller";
import { RETAIL_GIFT_CARD_TRANSACTIONS_TYPES } from "./giftCardTransactions.types";
import { giftCardTransactionsBodySchema, giftCardTransactionsIdParamsSchema, giftCardTransactionsQuerySchema } from "./giftCardTransactions.validator";

@injectable()
export class RetailGiftCardTransactionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_GIFT_CARD_TRANSACTIONS_TYPES.Controller) private giftCardTransactionsController: RetailGiftCardTransactionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "gift-card-transactions": ["read"] }),
      zodValidate(giftCardTransactionsQuerySchema, "query"),
      this.giftCardTransactionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "gift-card-transactions": ["create"] }),
      zodValidate(giftCardTransactionsBodySchema, "body"),
      this.giftCardTransactionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "gift-card-transactions": ["read"] }),
      zodValidate(giftCardTransactionsIdParamsSchema, "params"),
      this.giftCardTransactionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "gift-card-transactions": ["update"] }),
      zodValidate(giftCardTransactionsIdParamsSchema, "params"),
      zodValidate(giftCardTransactionsBodySchema, "body"),
      this.giftCardTransactionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "gift-card-transactions": ["delete"] }),
      zodValidate(giftCardTransactionsIdParamsSchema, "params"),
      this.giftCardTransactionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
