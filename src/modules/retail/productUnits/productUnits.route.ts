import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailProductUnitsController } from "./productUnits.controller";
import { RETAIL_PRODUCT_UNITS_TYPES } from "./productUnits.types";
import { productUnitsBodySchema, productUnitsIdParamsSchema, productUnitsQuerySchema } from "./productUnits.validator";

@injectable()
export class RetailProductUnitsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PRODUCT_UNITS_TYPES.Controller) private productUnitsController: RetailProductUnitsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "product-units": ["read"] }),
      zodValidate(productUnitsQuerySchema, "query"),
      this.productUnitsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "product-units": ["create"] }),
      zodValidate(productUnitsBodySchema, "body"),
      this.productUnitsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "product-units": ["read"] }),
      zodValidate(productUnitsIdParamsSchema, "params"),
      this.productUnitsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "product-units": ["update"] }),
      zodValidate(productUnitsIdParamsSchema, "params"),
      zodValidate(productUnitsBodySchema, "body"),
      this.productUnitsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "product-units": ["delete"] }),
      zodValidate(productUnitsIdParamsSchema, "params"),
      this.productUnitsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
