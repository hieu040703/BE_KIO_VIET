import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPriceBooksController } from "./priceBooks.controller";
import { RETAIL_PRICE_BOOKS_TYPES } from "./priceBooks.types";
import { priceBooksBodySchema, priceBooksIdParamsSchema, priceBooksQuerySchema } from "./priceBooks.validator";

@injectable()
export class RetailPriceBooksRouter {
  private router: Router;

  constructor(@inject(RETAIL_PRICE_BOOKS_TYPES.Controller) private priceBooksController: RetailPriceBooksController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "price-books": ["read"] }),
      zodValidate(priceBooksQuerySchema, "query"),
      this.priceBooksController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "price-books": ["create"] }),
      zodValidate(priceBooksBodySchema, "body"),
      this.priceBooksController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "price-books": ["read"] }),
      zodValidate(priceBooksIdParamsSchema, "params"),
      this.priceBooksController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "price-books": ["update"] }),
      zodValidate(priceBooksIdParamsSchema, "params"),
      zodValidate(priceBooksBodySchema, "body"),
      this.priceBooksController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "price-books": ["delete"] }),
      zodValidate(priceBooksIdParamsSchema, "params"),
      this.priceBooksController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
