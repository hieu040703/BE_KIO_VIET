import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailExchangeItemsController } from "./exchangeItems.controller";
import { RETAIL_EXCHANGE_ITEMS_TYPES } from "./exchangeItems.types";
import { exchangeItemsBodySchema, exchangeItemsIdParamsSchema, exchangeItemsQuerySchema } from "./exchangeItems.validator";

@injectable()
export class RetailExchangeItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_EXCHANGE_ITEMS_TYPES.Controller) private exchangeItemsController: RetailExchangeItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "exchange-items": ["read"] }),
      zodValidate(exchangeItemsQuerySchema, "query"),
      this.exchangeItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "exchange-items": ["create"] }),
      zodValidate(exchangeItemsBodySchema, "body"),
      this.exchangeItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "exchange-items": ["read"] }),
      zodValidate(exchangeItemsIdParamsSchema, "params"),
      this.exchangeItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "exchange-items": ["update"] }),
      zodValidate(exchangeItemsIdParamsSchema, "params"),
      zodValidate(exchangeItemsBodySchema, "body"),
      this.exchangeItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "exchange-items": ["delete"] }),
      zodValidate(exchangeItemsIdParamsSchema, "params"),
      this.exchangeItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
