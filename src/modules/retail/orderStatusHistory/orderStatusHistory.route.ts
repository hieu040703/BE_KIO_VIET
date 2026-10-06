import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailOrderStatusHistoryController } from "./orderStatusHistory.controller";
import { RETAIL_ORDER_STATUS_HISTORY_TYPES } from "./orderStatusHistory.types";
import { orderStatusHistoryBodySchema, orderStatusHistoryIdParamsSchema, orderStatusHistoryQuerySchema } from "./orderStatusHistory.validator";

@injectable()
export class RetailOrderStatusHistoryRouter {
  private router: Router;

  constructor(@inject(RETAIL_ORDER_STATUS_HISTORY_TYPES.Controller) private orderStatusHistoryController: RetailOrderStatusHistoryController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "order-status-history": ["read"] }),
      zodValidate(orderStatusHistoryQuerySchema, "query"),
      this.orderStatusHistoryController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "order-status-history": ["create"] }),
      zodValidate(orderStatusHistoryBodySchema, "body"),
      this.orderStatusHistoryController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "order-status-history": ["read"] }),
      zodValidate(orderStatusHistoryIdParamsSchema, "params"),
      this.orderStatusHistoryController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "order-status-history": ["update"] }),
      zodValidate(orderStatusHistoryIdParamsSchema, "params"),
      zodValidate(orderStatusHistoryBodySchema, "body"),
      this.orderStatusHistoryController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "order-status-history": ["delete"] }),
      zodValidate(orderStatusHistoryIdParamsSchema, "params"),
      this.orderStatusHistoryController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
