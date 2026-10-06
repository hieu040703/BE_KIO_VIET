import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailGiftCardsController } from "./giftCards.controller";
import { RETAIL_GIFT_CARDS_TYPES } from "./giftCards.types";
import { giftCardsBodySchema, giftCardsIdParamsSchema, giftCardsQuerySchema } from "./giftCards.validator";

@injectable()
export class RetailGiftCardsRouter {
  private router: Router;

  constructor(@inject(RETAIL_GIFT_CARDS_TYPES.Controller) private giftCardsController: RetailGiftCardsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "gift-cards": ["read"] }),
      zodValidate(giftCardsQuerySchema, "query"),
      this.giftCardsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "gift-cards": ["create"] }),
      zodValidate(giftCardsBodySchema, "body"),
      this.giftCardsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "gift-cards": ["read"] }),
      zodValidate(giftCardsIdParamsSchema, "params"),
      this.giftCardsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "gift-cards": ["update"] }),
      zodValidate(giftCardsIdParamsSchema, "params"),
      zodValidate(giftCardsBodySchema, "body"),
      this.giftCardsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "gift-cards": ["delete"] }),
      zodValidate(giftCardsIdParamsSchema, "params"),
      this.giftCardsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
