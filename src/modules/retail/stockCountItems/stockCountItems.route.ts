import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailStockCountItemsController } from "./stockCountItems.controller";
import { RETAIL_STOCK_COUNT_ITEMS_TYPES } from "./stockCountItems.types";
import { stockCountItemsBodySchema, stockCountItemsIdParamsSchema, stockCountItemsQuerySchema } from "./stockCountItems.validator";

@injectable()
export class RetailStockCountItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_STOCK_COUNT_ITEMS_TYPES.Controller) private stockCountItemsController: RetailStockCountItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "stock-count-items": ["read"] }),
      zodValidate(stockCountItemsQuerySchema, "query"),
      this.stockCountItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "stock-count-items": ["create"] }),
      zodValidate(stockCountItemsBodySchema, "body"),
      this.stockCountItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "stock-count-items": ["read"] }),
      zodValidate(stockCountItemsIdParamsSchema, "params"),
      this.stockCountItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "stock-count-items": ["update"] }),
      zodValidate(stockCountItemsIdParamsSchema, "params"),
      zodValidate(stockCountItemsBodySchema, "body"),
      this.stockCountItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "stock-count-items": ["delete"] }),
      zodValidate(stockCountItemsIdParamsSchema, "params"),
      this.stockCountItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
