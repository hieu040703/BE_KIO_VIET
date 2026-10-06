import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailShippingOrdersController } from "./shippingOrders.controller";
import { RETAIL_SHIPPING_ORDERS_TYPES } from "./shippingOrders.types";
import { shippingOrdersBodySchema, shippingOrdersIdParamsSchema, shippingOrdersQuerySchema } from "./shippingOrders.validator";

@injectable()
export class RetailShippingOrdersRouter {
  private router: Router;

  constructor(@inject(RETAIL_SHIPPING_ORDERS_TYPES.Controller) private shippingOrdersController: RetailShippingOrdersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "shipping-orders": ["read"] }),
      zodValidate(shippingOrdersQuerySchema, "query"),
      this.shippingOrdersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "shipping-orders": ["create"] }),
      zodValidate(shippingOrdersBodySchema, "body"),
      this.shippingOrdersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "shipping-orders": ["read"] }),
      zodValidate(shippingOrdersIdParamsSchema, "params"),
      this.shippingOrdersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "shipping-orders": ["update"] }),
      zodValidate(shippingOrdersIdParamsSchema, "params"),
      zodValidate(shippingOrdersBodySchema, "body"),
      this.shippingOrdersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "shipping-orders": ["delete"] }),
      zodValidate(shippingOrdersIdParamsSchema, "params"),
      this.shippingOrdersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
