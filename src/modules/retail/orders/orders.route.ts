import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailOrdersController } from "./orders.controller";
import { RETAIL_ORDERS_TYPES } from "./orders.types";
import { ordersBodySchema, ordersIdParamsSchema, ordersQuerySchema } from "./orders.validator";

@injectable()
export class RetailOrdersRouter {
  private router: Router;

  constructor(@inject(RETAIL_ORDERS_TYPES.Controller) private ordersController: RetailOrdersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "orders": ["read"] }),
      zodValidate(ordersQuerySchema, "query"),
      this.ordersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "orders": ["create"] }),
      zodValidate(ordersBodySchema, "body"),
      this.ordersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "orders": ["read"] }),
      zodValidate(ordersIdParamsSchema, "params"),
      this.ordersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "orders": ["update"] }),
      zodValidate(ordersIdParamsSchema, "params"),
      zodValidate(ordersBodySchema, "body"),
      this.ordersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "orders": ["delete"] }),
      zodValidate(ordersIdParamsSchema, "params"),
      this.ordersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
