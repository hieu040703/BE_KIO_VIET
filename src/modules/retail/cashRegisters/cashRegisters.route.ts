import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCashRegistersController } from "./cashRegisters.controller";
import { RETAIL_CASH_REGISTERS_TYPES } from "./cashRegisters.types";
import { cashRegistersBodySchema, cashRegistersIdParamsSchema, cashRegistersQuerySchema } from "./cashRegisters.validator";

@injectable()
export class RetailCashRegistersRouter {
  private router: Router;

  constructor(@inject(RETAIL_CASH_REGISTERS_TYPES.Controller) private cashRegistersController: RetailCashRegistersController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "cash-registers": ["read"] }),
      zodValidate(cashRegistersQuerySchema, "query"),
      this.cashRegistersController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "cash-registers": ["create"] }),
      zodValidate(cashRegistersBodySchema, "body"),
      this.cashRegistersController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "cash-registers": ["read"] }),
      zodValidate(cashRegistersIdParamsSchema, "params"),
      this.cashRegistersController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "cash-registers": ["update"] }),
      zodValidate(cashRegistersIdParamsSchema, "params"),
      zodValidate(cashRegistersBodySchema, "body"),
      this.cashRegistersController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "cash-registers": ["delete"] }),
      zodValidate(cashRegistersIdParamsSchema, "params"),
      this.cashRegistersController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
