import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailAccountTransactionsController } from "./accountTransactions.controller";
import { RETAIL_ACCOUNT_TRANSACTIONS_TYPES } from "./accountTransactions.types";
import { accountTransactionsBodySchema, accountTransactionsIdParamsSchema, accountTransactionsQuerySchema } from "./accountTransactions.validator";

@injectable()
export class RetailAccountTransactionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_ACCOUNT_TRANSACTIONS_TYPES.Controller) private accountTransactionsController: RetailAccountTransactionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "account-transactions": ["read"] }),
      zodValidate(accountTransactionsQuerySchema, "query"),
      this.accountTransactionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "account-transactions": ["create"] }),
      zodValidate(accountTransactionsBodySchema, "body"),
      this.accountTransactionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "account-transactions": ["read"] }),
      zodValidate(accountTransactionsIdParamsSchema, "params"),
      this.accountTransactionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "account-transactions": ["update"] }),
      zodValidate(accountTransactionsIdParamsSchema, "params"),
      zodValidate(accountTransactionsBodySchema, "body"),
      this.accountTransactionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "account-transactions": ["delete"] }),
      zodValidate(accountTransactionsIdParamsSchema, "params"),
      this.accountTransactionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
