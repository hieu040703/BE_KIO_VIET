import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailStockTransfersController } from "./stockTransfers.controller";
import { RETAIL_STOCK_TRANSFERS_TYPES } from "./stockTransfers.types";
import { stockTransfersBodySchema, stockTransfersIdParamsSchema, stockTransfersQuerySchema } from "./stockTransfers.validator";

@injectable()
export class RetailStockTransfersRouter {
  private router: Router;

  constructor(@inject(RETAIL_STOCK_TRANSFERS_TYPES.Controller) private stockTransfersController: RetailStockTransfersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "stock-transfers": ["read"] }),
      zodValidate(stockTransfersQuerySchema, "query"),
      this.stockTransfersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "stock-transfers": ["create"] }),
      zodValidate(stockTransfersBodySchema, "body"),
      this.stockTransfersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "stock-transfers": ["read"] }),
      zodValidate(stockTransfersIdParamsSchema, "params"),
      this.stockTransfersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "stock-transfers": ["update"] }),
      zodValidate(stockTransfersIdParamsSchema, "params"),
      zodValidate(stockTransfersBodySchema, "body"),
      this.stockTransfersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "stock-transfers": ["delete"] }),
      zodValidate(stockTransfersIdParamsSchema, "params"),
      this.stockTransfersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
