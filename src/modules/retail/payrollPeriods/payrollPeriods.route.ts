import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPayrollPeriodsController } from "./payrollPeriods.controller";
import { RETAIL_PAYROLL_PERIODS_TYPES } from "./payrollPeriods.types";
import { payrollPeriodsBodySchema, payrollPeriodsIdParamsSchema, payrollPeriodsQuerySchema } from "./payrollPeriods.validator";

@injectable()
export class RetailPayrollPeriodsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PAYROLL_PERIODS_TYPES.Controller) private payrollPeriodsController: RetailPayrollPeriodsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "payroll-periods": ["read"] }),
      zodValidate(payrollPeriodsQuerySchema, "query"),
      this.payrollPeriodsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "payroll-periods": ["create"] }),
      zodValidate(payrollPeriodsBodySchema, "body"),
      this.payrollPeriodsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "payroll-periods": ["read"] }),
      zodValidate(payrollPeriodsIdParamsSchema, "params"),
      this.payrollPeriodsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "payroll-periods": ["update"] }),
      zodValidate(payrollPeriodsIdParamsSchema, "params"),
      zodValidate(payrollPeriodsBodySchema, "body"),
      this.payrollPeriodsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "payroll-periods": ["delete"] }),
      zodValidate(payrollPeriodsIdParamsSchema, "params"),
      this.payrollPeriodsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
