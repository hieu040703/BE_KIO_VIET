import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailPayrollsController } from "./payrolls.controller";
import { RETAIL_PAYROLLS_TYPES } from "./payrolls.types";
import { payrollsBodySchema, payrollsIdParamsSchema, payrollsQuerySchema } from "./payrolls.validator";

@injectable()
export class RetailPayrollsRouter {
  private router: Router;

  constructor(@inject(RETAIL_PAYROLLS_TYPES.Controller) private payrollsController: RetailPayrollsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "payrolls": ["read"] }),
      zodValidate(payrollsQuerySchema, "query"),
      this.payrollsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "payrolls": ["create"] }),
      zodValidate(payrollsBodySchema, "body"),
      this.payrollsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "payrolls": ["read"] }),
      zodValidate(payrollsIdParamsSchema, "params"),
      this.payrollsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "payrolls": ["update"] }),
      zodValidate(payrollsIdParamsSchema, "params"),
      zodValidate(payrollsBodySchema, "body"),
      this.payrollsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "payrolls": ["delete"] }),
      zodValidate(payrollsIdParamsSchema, "params"),
      this.payrollsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
