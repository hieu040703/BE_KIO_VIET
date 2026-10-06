import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPriceBookItemsController } from "./priceBookItems.controller";
import { RETAIL_PRICE_BOOK_ITEMS_TYPES } from "./priceBookItems.types";
import { priceBookItemsBodySchema, priceBookItemsIdParamsSchema, priceBookItemsQuerySchema } from "./priceBookItems.validator";

@injectable()
export class RetailPriceBookItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PRICE_BOOK_ITEMS_TYPES.Controller) private priceBookItemsController: RetailPriceBookItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "price-book-items": ["read"] }),
      zodValidate(priceBookItemsQuerySchema, "query"),
      this.priceBookItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "price-book-items": ["create"] }),
      zodValidate(priceBookItemsBodySchema, "body"),
      this.priceBookItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "price-book-items": ["read"] }),
      zodValidate(priceBookItemsIdParamsSchema, "params"),
      this.priceBookItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "price-book-items": ["update"] }),
      zodValidate(priceBookItemsIdParamsSchema, "params"),
      zodValidate(priceBookItemsBodySchema, "body"),
      this.priceBookItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "price-book-items": ["delete"] }),
      zodValidate(priceBookItemsIdParamsSchema, "params"),
      this.priceBookItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
