import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailStockCountsController } from "./stockCounts.controller";
import { RETAIL_STOCK_COUNTS_TYPES } from "./stockCounts.types";
import { stockCountsBodySchema, stockCountsIdParamsSchema, stockCountsQuerySchema } from "./stockCounts.validator";

@injectable()
export class RetailStockCountsRouter {
  private router: Router;

  constructor(@inject(RETAIL_STOCK_COUNTS_TYPES.Controller) private stockCountsController: RetailStockCountsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "stock-counts": ["read"] }),
      zodValidate(stockCountsQuerySchema, "query"),
      this.stockCountsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "stock-counts": ["create"] }),
      zodValidate(stockCountsBodySchema, "body"),
      this.stockCountsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "stock-counts": ["read"] }),
      zodValidate(stockCountsIdParamsSchema, "params"),
      this.stockCountsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "stock-counts": ["update"] }),
      zodValidate(stockCountsIdParamsSchema, "params"),
      zodValidate(stockCountsBodySchema, "body"),
      this.stockCountsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "stock-counts": ["delete"] }),
      zodValidate(stockCountsIdParamsSchema, "params"),
      this.stockCountsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
