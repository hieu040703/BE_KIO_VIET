import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCategoriesController } from "./categories.controller";
import { RETAIL_CATEGORIES_TYPES } from "./categories.types";
import { categoriesBodySchema, categoriesIdParamsSchema, categoriesQuerySchema } from "./categories.validator";

@injectable()
export class RetailCategoriesRouter {
  private router: Router;

  constructor(@inject(RETAIL_CATEGORIES_TYPES.Controller) private categoriesController: RetailCategoriesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "categories": ["read"] }),
      zodValidate(categoriesQuerySchema, "query"),
      this.categoriesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "categories": ["create"] }),
      zodValidate(categoriesBodySchema, "body"),
      this.categoriesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "categories": ["read"] }),
      zodValidate(categoriesIdParamsSchema, "params"),
      this.categoriesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "categories": ["update"] }),
      zodValidate(categoriesIdParamsSchema, "params"),
      zodValidate(categoriesBodySchema, "body"),
      this.categoriesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "categories": ["delete"] }),
      zodValidate(categoriesIdParamsSchema, "params"),
      this.categoriesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
