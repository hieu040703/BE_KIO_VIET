import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCustomerDebtTransactionsController } from "./customerDebtTransactions.controller";
import { RETAIL_CUSTOMER_DEBT_TRANSACTIONS_TYPES } from "./customerDebtTransactions.types";
import { customerDebtTransactionsBodySchema, customerDebtTransactionsIdParamsSchema, customerDebtTransactionsQuerySchema } from "./customerDebtTransactions.validator";

@injectable()
export class RetailCustomerDebtTransactionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_CUSTOMER_DEBT_TRANSACTIONS_TYPES.Controller) private customerDebtTransactionsController: RetailCustomerDebtTransactionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "customer-debt-transactions": ["read"] }),
      zodValidate(customerDebtTransactionsQuerySchema, "query"),
      this.customerDebtTransactionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "customer-debt-transactions": ["create"] }),
      zodValidate(customerDebtTransactionsBodySchema, "body"),
      this.customerDebtTransactionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "customer-debt-transactions": ["read"] }),
      zodValidate(customerDebtTransactionsIdParamsSchema, "params"),
      this.customerDebtTransactionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "customer-debt-transactions": ["update"] }),
      zodValidate(customerDebtTransactionsIdParamsSchema, "params"),
      zodValidate(customerDebtTransactionsBodySchema, "body"),
      this.customerDebtTransactionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "customer-debt-transactions": ["delete"] }),
      zodValidate(customerDebtTransactionsIdParamsSchema, "params"),
      this.customerDebtTransactionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
