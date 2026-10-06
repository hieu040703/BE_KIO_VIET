import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPayrollItemsController } from "./payrollItems.controller";
import { RETAIL_PAYROLL_ITEMS_TYPES } from "./payrollItems.types";
import { payrollItemsBodySchema, payrollItemsIdParamsSchema, payrollItemsQuerySchema } from "./payrollItems.validator";

@injectable()
export class RetailPayrollItemsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PAYROLL_ITEMS_TYPES.Controller) private payrollItemsController: RetailPayrollItemsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "payroll-items": ["read"] }),
      zodValidate(payrollItemsQuerySchema, "query"),
      this.payrollItemsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "payroll-items": ["create"] }),
      zodValidate(payrollItemsBodySchema, "body"),
      this.payrollItemsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "payroll-items": ["read"] }),
      zodValidate(payrollItemsIdParamsSchema, "params"),
      this.payrollItemsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "payroll-items": ["update"] }),
      zodValidate(payrollItemsIdParamsSchema, "params"),
      zodValidate(payrollItemsBodySchema, "body"),
      this.payrollItemsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "payroll-items": ["delete"] }),
      zodValidate(payrollItemsIdParamsSchema, "params"),
      this.payrollItemsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
