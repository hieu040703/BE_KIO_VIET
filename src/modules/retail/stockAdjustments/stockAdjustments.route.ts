import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailStockAdjustmentsController } from "./stockAdjustments.controller";
import { RETAIL_STOCK_ADJUSTMENTS_TYPES } from "./stockAdjustments.types";
import { stockAdjustmentsBodySchema, stockAdjustmentsIdParamsSchema, stockAdjustmentsQuerySchema } from "./stockAdjustments.validator";

@injectable()
export class RetailStockAdjustmentsRouter {
  private router: Router;

  constructor(@inject(RETAIL_STOCK_ADJUSTMENTS_TYPES.Controller) private stockAdjustmentsController: RetailStockAdjustmentsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "stock-adjustments": ["read"] }),
      zodValidate(stockAdjustmentsQuerySchema, "query"),
      this.stockAdjustmentsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "stock-adjustments": ["create"] }),
      zodValidate(stockAdjustmentsBodySchema, "body"),
      this.stockAdjustmentsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "stock-adjustments": ["read"] }),
      zodValidate(stockAdjustmentsIdParamsSchema, "params"),
      this.stockAdjustmentsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "stock-adjustments": ["update"] }),
      zodValidate(stockAdjustmentsIdParamsSchema, "params"),
      zodValidate(stockAdjustmentsBodySchema, "body"),
      this.stockAdjustmentsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "stock-adjustments": ["delete"] }),
      zodValidate(stockAdjustmentsIdParamsSchema, "params"),
      this.stockAdjustmentsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
