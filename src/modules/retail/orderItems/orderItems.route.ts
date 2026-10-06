import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailOrderItemsController } from "./orderItems.controller";
import { RETAIL_ORDER_ITEMS_TYPES } from "./orderItems.types";
import { orderItemsBodySchema, orderItemsIdParamsSchema, orderItemsQuerySchema } from "./orderItems.validator";

@injectable()
export class RetailOrderItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_ORDER_ITEMS_TYPES.Controller) private orderItemsController: RetailOrderItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "order-items": ["read"] }),
      zodValidate(orderItemsQuerySchema, "query"),
      this.orderItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "order-items": ["create"] }),
      zodValidate(orderItemsBodySchema, "body"),
      this.orderItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "order-items": ["read"] }),
      zodValidate(orderItemsIdParamsSchema, "params"),
      this.orderItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "order-items": ["update"] }),
      zodValidate(orderItemsIdParamsSchema, "params"),
      zodValidate(orderItemsBodySchema, "body"),
      this.orderItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "order-items": ["delete"] }),
      zodValidate(orderItemsIdParamsSchema, "params"),
      this.orderItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
