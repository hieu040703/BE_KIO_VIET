import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailFinancialAccountsController } from "./financialAccounts.controller";
import { RETAIL_FINANCIAL_ACCOUNTS_TYPES } from "./financialAccounts.types";
import { financialAccountsBodySchema, financialAccountsIdParamsSchema, financialAccountsQuerySchema } from "./financialAccounts.validator";

@injectable()
export class RetailFinancialAccountsRouter {
  private router: Router;

  constructor(@inject(RETAIL_FINANCIAL_ACCOUNTS_TYPES.Controller) private financialAccountsController: RetailFinancialAccountsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "financial-accounts": ["read"] }),
      zodValidate(financialAccountsQuerySchema, "query"),
      this.financialAccountsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "financial-accounts": ["create"] }),
      zodValidate(financialAccountsBodySchema, "body"),
      this.financialAccountsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "financial-accounts": ["read"] }),
      zodValidate(financialAccountsIdParamsSchema, "params"),
      this.financialAccountsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "financial-accounts": ["update"] }),
      zodValidate(financialAccountsIdParamsSchema, "params"),
      zodValidate(financialAccountsBodySchema, "body"),
      this.financialAccountsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "financial-accounts": ["delete"] }),
      zodValidate(financialAccountsIdParamsSchema, "params"),
      this.financialAccountsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
