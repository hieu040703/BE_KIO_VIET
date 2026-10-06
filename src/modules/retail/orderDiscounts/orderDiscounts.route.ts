import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailOrderDiscountsController } from "./orderDiscounts.controller";
import { RETAIL_ORDER_DISCOUNTS_TYPES } from "./orderDiscounts.types";
import { orderDiscountsBodySchema, orderDiscountsIdParamsSchema, orderDiscountsQuerySchema } from "./orderDiscounts.validator";

@injectable()
export class RetailOrderDiscountsRouter {
  private router: Router;

  constructor(@inject(RETAIL_ORDER_DISCOUNTS_TYPES.Controller) private orderDiscountsController: RetailOrderDiscountsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "order-discounts": ["read"] }),
      zodValidate(orderDiscountsQuerySchema, "query"),
      this.orderDiscountsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "order-discounts": ["create"] }),
      zodValidate(orderDiscountsBodySchema, "body"),
      this.orderDiscountsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "order-discounts": ["read"] }),
      zodValidate(orderDiscountsIdParamsSchema, "params"),
      this.orderDiscountsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "order-discounts": ["update"] }),
      zodValidate(orderDiscountsIdParamsSchema, "params"),
      zodValidate(orderDiscountsBodySchema, "body"),
      this.orderDiscountsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "order-discounts": ["delete"] }),
      zodValidate(orderDiscountsIdParamsSchema, "params"),
      this.orderDiscountsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
