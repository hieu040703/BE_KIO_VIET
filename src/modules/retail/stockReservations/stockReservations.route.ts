import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailStockReservationsController } from "./stockReservations.controller";
import { RETAIL_STOCK_RESERVATIONS_TYPES } from "./stockReservations.types";
import { stockReservationsBodySchema, stockReservationsIdParamsSchema, stockReservationsQuerySchema } from "./stockReservations.validator";

@injectable()
export class RetailStockReservationsRouter {
  private router: Router;

  constructor(@inject(RETAIL_STOCK_RESERVATIONS_TYPES.Controller) private stockReservationsController: RetailStockReservationsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "stock-reservations": ["read"] }),
      zodValidate(stockReservationsQuerySchema, "query"),
      this.stockReservationsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "stock-reservations": ["create"] }),
      zodValidate(stockReservationsBodySchema, "body"),
      this.stockReservationsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "stock-reservations": ["read"] }),
      zodValidate(stockReservationsIdParamsSchema, "params"),
      this.stockReservationsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "stock-reservations": ["update"] }),
      zodValidate(stockReservationsIdParamsSchema, "params"),
      zodValidate(stockReservationsBodySchema, "body"),
      this.stockReservationsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "stock-reservations": ["delete"] }),
      zodValidate(stockReservationsIdParamsSchema, "params"),
      this.stockReservationsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
