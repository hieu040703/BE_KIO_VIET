import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailCustomerDebtsController } from "./customerDebts.controller";
import { RETAIL_CUSTOMER_DEBTS_TYPES } from "./customerDebts.types";
import { customerDebtsBodySchema, customerDebtsIdParamsSchema, customerDebtsQuerySchema } from "./customerDebts.validator";

@injectable()
export class RetailCustomerDebtsRouter {
  private router: Router;

  constructor(@inject(RETAIL_CUSTOMER_DEBTS_TYPES.Controller) private customerDebtsController: RetailCustomerDebtsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "customer-debts": ["read"] }),
      zodValidate(customerDebtsQuerySchema, "query"),
      this.customerDebtsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "customer-debts": ["create"] }),
      zodValidate(customerDebtsBodySchema, "body"),
      this.customerDebtsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "customer-debts": ["read"] }),
      zodValidate(customerDebtsIdParamsSchema, "params"),
      this.customerDebtsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "customer-debts": ["update"] }),
      zodValidate(customerDebtsIdParamsSchema, "params"),
      zodValidate(customerDebtsBodySchema, "body"),
      this.customerDebtsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "customer-debts": ["delete"] }),
      zodValidate(customerDebtsIdParamsSchema, "params"),
      this.customerDebtsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
