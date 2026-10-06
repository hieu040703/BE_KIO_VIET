import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailExpensesController } from "./expenses.controller";
import { RETAIL_EXPENSES_TYPES } from "./expenses.types";
import { expensesBodySchema, expensesIdParamsSchema, expensesQuerySchema } from "./expenses.validator";

@injectable()
export class RetailExpensesRouter {
  private router: Router;

  constructor(@inject(RETAIL_EXPENSES_TYPES.Controller) private expensesController: RetailExpensesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "expenses": ["read"] }),
      zodValidate(expensesQuerySchema, "query"),
      this.expensesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "expenses": ["create"] }),
      zodValidate(expensesBodySchema, "body"),
      this.expensesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "expenses": ["read"] }),
      zodValidate(expensesIdParamsSchema, "params"),
      this.expensesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "expenses": ["update"] }),
      zodValidate(expensesIdParamsSchema, "params"),
      zodValidate(expensesBodySchema, "body"),
      this.expensesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "expenses": ["delete"] }),
      zodValidate(expensesIdParamsSchema, "params"),
      this.expensesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
