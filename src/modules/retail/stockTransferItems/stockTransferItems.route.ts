import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailStockTransferItemsController } from "./stockTransferItems.controller";
import { RETAIL_STOCK_TRANSFER_ITEMS_TYPES } from "./stockTransferItems.types";
import { stockTransferItemsBodySchema, stockTransferItemsIdParamsSchema, stockTransferItemsQuerySchema } from "./stockTransferItems.validator";

@injectable()
export class RetailStockTransferItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_STOCK_TRANSFER_ITEMS_TYPES.Controller) private stockTransferItemsController: RetailStockTransferItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "stock-transfer-items": ["read"] }),
      zodValidate(stockTransferItemsQuerySchema, "query"),
      this.stockTransferItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "stock-transfer-items": ["create"] }),
      zodValidate(stockTransferItemsBodySchema, "body"),
      this.stockTransferItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "stock-transfer-items": ["read"] }),
      zodValidate(stockTransferItemsIdParamsSchema, "params"),
      this.stockTransferItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "stock-transfer-items": ["update"] }),
      zodValidate(stockTransferItemsIdParamsSchema, "params"),
      zodValidate(stockTransferItemsBodySchema, "body"),
      this.stockTransferItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "stock-transfer-items": ["delete"] }),
      zodValidate(stockTransferItemsIdParamsSchema, "params"),
      this.stockTransferItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
