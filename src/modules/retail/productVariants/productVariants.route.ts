import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailProductVariantsController } from "./productVariants.controller";
import { RETAIL_PRODUCT_VARIANTS_TYPES } from "./productVariants.types";
import { productVariantsBodySchema, productVariantsIdParamsSchema, productVariantsQuerySchema } from "./productVariants.validator";

@injectable()
export class RetailProductVariantsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PRODUCT_VARIANTS_TYPES.Controller) private productVariantsController: RetailProductVariantsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "product-variants": ["read"] }),
      zodValidate(productVariantsQuerySchema, "query"),
      this.productVariantsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "product-variants": ["create"] }),
      zodValidate(productVariantsBodySchema, "body"),
      this.productVariantsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "product-variants": ["read"] }),
      zodValidate(productVariantsIdParamsSchema, "params"),
      this.productVariantsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "product-variants": ["update"] }),
      zodValidate(productVariantsIdParamsSchema, "params"),
      zodValidate(productVariantsBodySchema, "body"),
      this.productVariantsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "product-variants": ["delete"] }),
      zodValidate(productVariantsIdParamsSchema, "params"),
      this.productVariantsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
