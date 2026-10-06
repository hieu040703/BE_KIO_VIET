import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailBrandsController } from "./brands.controller";
import { RETAIL_BRANDS_TYPES } from "./brands.types";
import { brandsBodySchema, brandsIdParamsSchema, brandsQuerySchema } from "./brands.validator";

@injectable()
export class RetailBrandsRouter {
  private router: Router;

  constructor(@inject(RETAIL_BRANDS_TYPES.Controller) private brandsController: RetailBrandsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "brands": ["read"] }),
      zodValidate(brandsQuerySchema, "query"),
      this.brandsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "brands": ["create"] }),
      zodValidate(brandsBodySchema, "body"),
      this.brandsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "brands": ["read"] }),
      zodValidate(brandsIdParamsSchema, "params"),
      this.brandsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "brands": ["update"] }),
      zodValidate(brandsIdParamsSchema, "params"),
      zodValidate(brandsBodySchema, "body"),
      this.brandsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "brands": ["delete"] }),
      zodValidate(brandsIdParamsSchema, "params"),
      this.brandsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
