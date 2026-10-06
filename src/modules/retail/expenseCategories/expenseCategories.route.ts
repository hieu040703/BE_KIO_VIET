import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailExpenseCategoriesController } from "./expenseCategories.controller";
import { RETAIL_EXPENSE_CATEGORIES_TYPES } from "./expenseCategories.types";
import { expenseCategoriesBodySchema, expenseCategoriesIdParamsSchema, expenseCategoriesQuerySchema } from "./expenseCategories.validator";

@injectable()
export class RetailExpenseCategoriesRouter {
  private router: Router;

  constructor(@inject(RETAIL_EXPENSE_CATEGORIES_TYPES.Controller) private expenseCategoriesController: RetailExpenseCategoriesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "expense-categories": ["read"] }),
      zodValidate(expenseCategoriesQuerySchema, "query"),
      this.expenseCategoriesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "expense-categories": ["create"] }),
      zodValidate(expenseCategoriesBodySchema, "body"),
      this.expenseCategoriesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "expense-categories": ["read"] }),
      zodValidate(expenseCategoriesIdParamsSchema, "params"),
      this.expenseCategoriesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "expense-categories": ["update"] }),
      zodValidate(expenseCategoriesIdParamsSchema, "params"),
      zodValidate(expenseCategoriesBodySchema, "body"),
      this.expenseCategoriesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "expense-categories": ["delete"] }),
      zodValidate(expenseCategoriesIdParamsSchema, "params"),
      this.expenseCategoriesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
