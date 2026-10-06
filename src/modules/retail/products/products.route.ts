import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailProductsController } from "./products.controller";
import { RETAIL_PRODUCTS_TYPES } from "./products.types";
import { productsBodySchema, productsIdParamsSchema, productsQuerySchema } from "./products.validator";

@injectable()
export class RetailProductsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PRODUCTS_TYPES.Controller) private productsController: RetailProductsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "products": ["read"] }),
      zodValidate(productsQuerySchema, "query"),
      this.productsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "products": ["create"] }),
      zodValidate(productsBodySchema, "body"),
      this.productsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "products": ["read"] }),
      zodValidate(productsIdParamsSchema, "params"),
      this.productsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "products": ["update"] }),
      zodValidate(productsIdParamsSchema, "params"),
      zodValidate(productsBodySchema, "body"),
      this.productsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "products": ["delete"] }),
      zodValidate(productsIdParamsSchema, "params"),
      this.productsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
