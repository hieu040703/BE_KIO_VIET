import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPurchaseOrderItemsController } from "./purchaseOrderItems.controller";
import { RETAIL_PURCHASE_ORDER_ITEMS_TYPES } from "./purchaseOrderItems.types";
import { purchaseOrderItemsBodySchema, purchaseOrderItemsIdParamsSchema, purchaseOrderItemsQuerySchema } from "./purchaseOrderItems.validator";

@injectable()
export class RetailPurchaseOrderItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PURCHASE_ORDER_ITEMS_TYPES.Controller) private purchaseOrderItemsController: RetailPurchaseOrderItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "purchase-order-items": ["read"] }),
      zodValidate(purchaseOrderItemsQuerySchema, "query"),
      this.purchaseOrderItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "purchase-order-items": ["create"] }),
      zodValidate(purchaseOrderItemsBodySchema, "body"),
      this.purchaseOrderItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "purchase-order-items": ["read"] }),
      zodValidate(purchaseOrderItemsIdParamsSchema, "params"),
      this.purchaseOrderItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "purchase-order-items": ["update"] }),
      zodValidate(purchaseOrderItemsIdParamsSchema, "params"),
      zodValidate(purchaseOrderItemsBodySchema, "body"),
      this.purchaseOrderItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "purchase-order-items": ["delete"] }),
      zodValidate(purchaseOrderItemsIdParamsSchema, "params"),
      this.purchaseOrderItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
