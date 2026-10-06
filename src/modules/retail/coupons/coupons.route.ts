import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCouponsController } from "./coupons.controller";
import { RETAIL_COUPONS_TYPES } from "./coupons.types";
import { couponsBodySchema, couponsIdParamsSchema, couponsQuerySchema } from "./coupons.validator";

@injectable()
export class RetailCouponsRouter {
  private router: Router;

  constructor(@inject(RETAIL_COUPONS_TYPES.Controller) private couponsController: RetailCouponsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "coupons": ["read"] }),
      zodValidate(couponsQuerySchema, "query"),
      this.couponsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "coupons": ["create"] }),
      zodValidate(couponsBodySchema, "body"),
      this.couponsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "coupons": ["read"] }),
      zodValidate(couponsIdParamsSchema, "params"),
      this.couponsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "coupons": ["update"] }),
      zodValidate(couponsIdParamsSchema, "params"),
      zodValidate(couponsBodySchema, "body"),
      this.couponsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "coupons": ["delete"] }),
      zodValidate(couponsIdParamsSchema, "params"),
      this.couponsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
