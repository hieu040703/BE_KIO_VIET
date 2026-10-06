import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPromotionProductsController } from "./promotionProducts.controller";
import { RETAIL_PROMOTION_PRODUCTS_TYPES } from "./promotionProducts.types";
import { promotionProductsBodySchema, promotionProductsIdParamsSchema, promotionProductsQuerySchema } from "./promotionProducts.validator";

@injectable()
export class RetailPromotionProductsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PROMOTION_PRODUCTS_TYPES.Controller) private promotionProductsController: RetailPromotionProductsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "promotion-products": ["read"] }),
      zodValidate(promotionProductsQuerySchema, "query"),
      this.promotionProductsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "promotion-products": ["create"] }),
      zodValidate(promotionProductsBodySchema, "body"),
      this.promotionProductsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "promotion-products": ["read"] }),
      zodValidate(promotionProductsIdParamsSchema, "params"),
      this.promotionProductsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "promotion-products": ["update"] }),
      zodValidate(promotionProductsIdParamsSchema, "params"),
      zodValidate(promotionProductsBodySchema, "body"),
      this.promotionProductsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "promotion-products": ["delete"] }),
      zodValidate(promotionProductsIdParamsSchema, "params"),
      this.promotionProductsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
