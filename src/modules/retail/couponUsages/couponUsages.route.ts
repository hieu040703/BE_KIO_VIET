import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCouponUsagesController } from "./couponUsages.controller";
import { RETAIL_COUPON_USAGES_TYPES } from "./couponUsages.types";
import { couponUsagesBodySchema, couponUsagesIdParamsSchema, couponUsagesQuerySchema } from "./couponUsages.validator";

@injectable()
export class RetailCouponUsagesRouter {
  private router: Router;

  constructor(@inject(RETAIL_COUPON_USAGES_TYPES.Controller) private couponUsagesController: RetailCouponUsagesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "coupon-usages": ["read"] }),
      zodValidate(couponUsagesQuerySchema, "query"),
      this.couponUsagesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "coupon-usages": ["create"] }),
      zodValidate(couponUsagesBodySchema, "body"),
      this.couponUsagesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "coupon-usages": ["read"] }),
      zodValidate(couponUsagesIdParamsSchema, "params"),
      this.couponUsagesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "coupon-usages": ["update"] }),
      zodValidate(couponUsagesIdParamsSchema, "params"),
      zodValidate(couponUsagesBodySchema, "body"),
      this.couponUsagesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "coupon-usages": ["delete"] }),
      zodValidate(couponUsagesIdParamsSchema, "params"),
      this.couponUsagesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
