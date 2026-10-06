import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailStockLedgersController } from "./stockLedgers.controller";
import { RETAIL_STOCK_LEDGERS_TYPES } from "./stockLedgers.types";
import { stockLedgersBodySchema, stockLedgersIdParamsSchema, stockLedgersQuerySchema } from "./stockLedgers.validator";

@injectable()
export class RetailStockLedgersRouter {
  private router: Router;

  constructor(@inject(RETAIL_STOCK_LEDGERS_TYPES.Controller) private stockLedgersController: RetailStockLedgersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "stock-ledgers": ["read"] }),
      zodValidate(stockLedgersQuerySchema, "query"),
      this.stockLedgersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "stock-ledgers": ["create"] }),
      zodValidate(stockLedgersBodySchema, "body"),
      this.stockLedgersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "stock-ledgers": ["read"] }),
      zodValidate(stockLedgersIdParamsSchema, "params"),
      this.stockLedgersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "stock-ledgers": ["update"] }),
      zodValidate(stockLedgersIdParamsSchema, "params"),
      zodValidate(stockLedgersBodySchema, "body"),
      this.stockLedgersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "stock-ledgers": ["delete"] }),
      zodValidate(stockLedgersIdParamsSchema, "params"),
      this.stockLedgersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
