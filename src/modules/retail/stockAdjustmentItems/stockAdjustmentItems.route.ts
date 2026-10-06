import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailStockAdjustmentItemsController } from "./stockAdjustmentItems.controller";
import { RETAIL_STOCK_ADJUSTMENT_ITEMS_TYPES } from "./stockAdjustmentItems.types";
import { stockAdjustmentItemsBodySchema, stockAdjustmentItemsIdParamsSchema, stockAdjustmentItemsQuerySchema } from "./stockAdjustmentItems.validator";

@injectable()
export class RetailStockAdjustmentItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_STOCK_ADJUSTMENT_ITEMS_TYPES.Controller) private stockAdjustmentItemsController: RetailStockAdjustmentItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "stock-adjustment-items": ["read"] }),
      zodValidate(stockAdjustmentItemsQuerySchema, "query"),
      this.stockAdjustmentItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "stock-adjustment-items": ["create"] }),
      zodValidate(stockAdjustmentItemsBodySchema, "body"),
      this.stockAdjustmentItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "stock-adjustment-items": ["read"] }),
      zodValidate(stockAdjustmentItemsIdParamsSchema, "params"),
      this.stockAdjustmentItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "stock-adjustment-items": ["update"] }),
      zodValidate(stockAdjustmentItemsIdParamsSchema, "params"),
      zodValidate(stockAdjustmentItemsBodySchema, "body"),
      this.stockAdjustmentItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "stock-adjustment-items": ["delete"] }),
      zodValidate(stockAdjustmentItemsIdParamsSchema, "params"),
      this.stockAdjustmentItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
