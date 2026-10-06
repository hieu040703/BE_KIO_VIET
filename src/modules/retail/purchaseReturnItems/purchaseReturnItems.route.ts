import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPurchaseReturnItemsController } from "./purchaseReturnItems.controller";
import { RETAIL_PURCHASE_RETURN_ITEMS_TYPES } from "./purchaseReturnItems.types";
import { purchaseReturnItemsBodySchema, purchaseReturnItemsIdParamsSchema, purchaseReturnItemsQuerySchema } from "./purchaseReturnItems.validator";

@injectable()
export class RetailPurchaseReturnItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PURCHASE_RETURN_ITEMS_TYPES.Controller) private purchaseReturnItemsController: RetailPurchaseReturnItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "purchase-return-items": ["read"] }),
      zodValidate(purchaseReturnItemsQuerySchema, "query"),
      this.purchaseReturnItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "purchase-return-items": ["create"] }),
      zodValidate(purchaseReturnItemsBodySchema, "body"),
      this.purchaseReturnItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "purchase-return-items": ["read"] }),
      zodValidate(purchaseReturnItemsIdParamsSchema, "params"),
      this.purchaseReturnItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "purchase-return-items": ["update"] }),
      zodValidate(purchaseReturnItemsIdParamsSchema, "params"),
      zodValidate(purchaseReturnItemsBodySchema, "body"),
      this.purchaseReturnItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "purchase-return-items": ["delete"] }),
      zodValidate(purchaseReturnItemsIdParamsSchema, "params"),
      this.purchaseReturnItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
