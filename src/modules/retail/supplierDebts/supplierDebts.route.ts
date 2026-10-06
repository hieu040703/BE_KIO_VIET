import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailSupplierDebtsController } from "./supplierDebts.controller";
import { RETAIL_SUPPLIER_DEBTS_TYPES } from "./supplierDebts.types";
import { supplierDebtsBodySchema, supplierDebtsIdParamsSchema, supplierDebtsQuerySchema } from "./supplierDebts.validator";

@injectable()
export class RetailSupplierDebtsRouter {
  private router: Router;

  constructor(@inject(RETAIL_SUPPLIER_DEBTS_TYPES.Controller) private supplierDebtsController: RetailSupplierDebtsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "supplier-debts": ["read"] }),
      zodValidate(supplierDebtsQuerySchema, "query"),
      this.supplierDebtsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "supplier-debts": ["create"] }),
      zodValidate(supplierDebtsBodySchema, "body"),
      this.supplierDebtsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "supplier-debts": ["read"] }),
      zodValidate(supplierDebtsIdParamsSchema, "params"),
      this.supplierDebtsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "supplier-debts": ["update"] }),
      zodValidate(supplierDebtsIdParamsSchema, "params"),
      zodValidate(supplierDebtsBodySchema, "body"),
      this.supplierDebtsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "supplier-debts": ["delete"] }),
      zodValidate(supplierDebtsIdParamsSchema, "params"),
      this.supplierDebtsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
