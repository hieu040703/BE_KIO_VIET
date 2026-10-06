import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCashMovementsController } from "./cashMovements.controller";
import { RETAIL_CASH_MOVEMENTS_TYPES } from "./cashMovements.types";
import { cashMovementsBodySchema, cashMovementsIdParamsSchema, cashMovementsQuerySchema } from "./cashMovements.validator";

@injectable()
export class RetailCashMovementsRouter {
  private router: Router;

  constructor(@inject(RETAIL_CASH_MOVEMENTS_TYPES.Controller) private cashMovementsController: RetailCashMovementsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "cash-movements": ["read"] }),
      zodValidate(cashMovementsQuerySchema, "query"),
      this.cashMovementsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "cash-movements": ["create"] }),
      zodValidate(cashMovementsBodySchema, "body"),
      this.cashMovementsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "cash-movements": ["read"] }),
      zodValidate(cashMovementsIdParamsSchema, "params"),
      this.cashMovementsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "cash-movements": ["update"] }),
      zodValidate(cashMovementsIdParamsSchema, "params"),
      zodValidate(cashMovementsBodySchema, "body"),
      this.cashMovementsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "cash-movements": ["delete"] }),
      zodValidate(cashMovementsIdParamsSchema, "params"),
      this.cashMovementsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
