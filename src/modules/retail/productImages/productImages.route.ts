import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailProductImagesController } from "./productImages.controller";
import { RETAIL_PRODUCT_IMAGES_TYPES } from "./productImages.types";
import { productImagesBodySchema, productImagesIdParamsSchema, productImagesQuerySchema } from "./productImages.validator";

@injectable()
export class RetailProductImagesRouter {
  private router: Router;

  constructor(@inject(RETAIL_PRODUCT_IMAGES_TYPES.Controller) private productImagesController: RetailProductImagesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "product-images": ["read"] }),
      zodValidate(productImagesQuerySchema, "query"),
      this.productImagesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "product-images": ["create"] }),
      zodValidate(productImagesBodySchema, "body"),
      this.productImagesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "product-images": ["read"] }),
      zodValidate(productImagesIdParamsSchema, "params"),
      this.productImagesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "product-images": ["update"] }),
      zodValidate(productImagesIdParamsSchema, "params"),
      zodValidate(productImagesBodySchema, "body"),
      this.productImagesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "product-images": ["delete"] }),
      zodValidate(productImagesIdParamsSchema, "params"),
      this.productImagesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
