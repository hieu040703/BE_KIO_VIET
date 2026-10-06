import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailProductBarcodesController } from "./productBarcodes.controller";
import { RETAIL_PRODUCT_BARCODES_TYPES } from "./productBarcodes.types";
import { productBarcodesBodySchema, productBarcodesIdParamsSchema, productBarcodesQuerySchema } from "./productBarcodes.validator";

@injectable()
export class RetailProductBarcodesRouter {
  private router: Router;

  constructor(@inject(RETAIL_PRODUCT_BARCODES_TYPES.Controller) private productBarcodesController: RetailProductBarcodesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "product-barcodes": ["read"] }),
      zodValidate(productBarcodesQuerySchema, "query"),
      this.productBarcodesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "product-barcodes": ["create"] }),
      zodValidate(productBarcodesBodySchema, "body"),
      this.productBarcodesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "product-barcodes": ["read"] }),
      zodValidate(productBarcodesIdParamsSchema, "params"),
      this.productBarcodesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "product-barcodes": ["update"] }),
      zodValidate(productBarcodesIdParamsSchema, "params"),
      zodValidate(productBarcodesBodySchema, "body"),
      this.productBarcodesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "product-barcodes": ["delete"] }),
      zodValidate(productBarcodesIdParamsSchema, "params"),
      this.productBarcodesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
