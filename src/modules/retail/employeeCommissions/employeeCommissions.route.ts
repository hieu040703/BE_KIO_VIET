import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailEmployeeCommissionsController } from "./employeeCommissions.controller";
import { RETAIL_EMPLOYEE_COMMISSIONS_TYPES } from "./employeeCommissions.types";
import { employeeCommissionsBodySchema, employeeCommissionsIdParamsSchema, employeeCommissionsQuerySchema } from "./employeeCommissions.validator";

@injectable()
export class RetailEmployeeCommissionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_EMPLOYEE_COMMISSIONS_TYPES.Controller) private employeeCommissionsController: RetailEmployeeCommissionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "employee-commissions": ["read"] }),
      zodValidate(employeeCommissionsQuerySchema, "query"),
      this.employeeCommissionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "employee-commissions": ["create"] }),
      zodValidate(employeeCommissionsBodySchema, "body"),
      this.employeeCommissionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "employee-commissions": ["read"] }),
      zodValidate(employeeCommissionsIdParamsSchema, "params"),
      this.employeeCommissionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "employee-commissions": ["update"] }),
      zodValidate(employeeCommissionsIdParamsSchema, "params"),
      zodValidate(employeeCommissionsBodySchema, "body"),
      this.employeeCommissionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "employee-commissions": ["delete"] }),
      zodValidate(employeeCommissionsIdParamsSchema, "params"),
      this.employeeCommissionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
