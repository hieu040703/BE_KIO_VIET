import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailSupplierDebtTransactionsController } from "./supplierDebtTransactions.controller";
import { RETAIL_SUPPLIER_DEBT_TRANSACTIONS_TYPES } from "./supplierDebtTransactions.types";
import { supplierDebtTransactionsBodySchema, supplierDebtTransactionsIdParamsSchema, supplierDebtTransactionsQuerySchema } from "./supplierDebtTransactions.validator";

@injectable()
export class RetailSupplierDebtTransactionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_SUPPLIER_DEBT_TRANSACTIONS_TYPES.Controller) private supplierDebtTransactionsController: RetailSupplierDebtTransactionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "supplier-debt-transactions": ["read"] }),
      zodValidate(supplierDebtTransactionsQuerySchema, "query"),
      this.supplierDebtTransactionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "supplier-debt-transactions": ["create"] }),
      zodValidate(supplierDebtTransactionsBodySchema, "body"),
      this.supplierDebtTransactionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "supplier-debt-transactions": ["read"] }),
      zodValidate(supplierDebtTransactionsIdParamsSchema, "params"),
      this.supplierDebtTransactionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "supplier-debt-transactions": ["update"] }),
      zodValidate(supplierDebtTransactionsIdParamsSchema, "params"),
      zodValidate(supplierDebtTransactionsBodySchema, "body"),
      this.supplierDebtTransactionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "supplier-debt-transactions": ["delete"] }),
      zodValidate(supplierDebtTransactionsIdParamsSchema, "params"),
      this.supplierDebtTransactionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
