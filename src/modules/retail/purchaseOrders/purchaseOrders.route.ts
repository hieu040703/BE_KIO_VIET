import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPurchaseOrdersController } from "./purchaseOrders.controller";
import { RETAIL_PURCHASE_ORDERS_TYPES } from "./purchaseOrders.types";
import { purchaseOrdersBodySchema, purchaseOrdersIdParamsSchema, purchaseOrdersQuerySchema } from "./purchaseOrders.validator";

@injectable()
export class RetailPurchaseOrdersRouter {
  private router: Router;

  constructor(@inject(RETAIL_PURCHASE_ORDERS_TYPES.Controller) private purchaseOrdersController: RetailPurchaseOrdersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "purchase-orders": ["read"] }),
      zodValidate(purchaseOrdersQuerySchema, "query"),
      this.purchaseOrdersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "purchase-orders": ["create"] }),
      zodValidate(purchaseOrdersBodySchema, "body"),
      this.purchaseOrdersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "purchase-orders": ["read"] }),
      zodValidate(purchaseOrdersIdParamsSchema, "params"),
      this.purchaseOrdersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "purchase-orders": ["update"] }),
      zodValidate(purchaseOrdersIdParamsSchema, "params"),
      zodValidate(purchaseOrdersBodySchema, "body"),
      this.purchaseOrdersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "purchase-orders": ["delete"] }),
      zodValidate(purchaseOrdersIdParamsSchema, "params"),
      this.purchaseOrdersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
