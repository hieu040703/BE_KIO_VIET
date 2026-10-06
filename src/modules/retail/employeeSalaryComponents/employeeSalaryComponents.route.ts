import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailEmployeeSalaryComponentsController } from "./employeeSalaryComponents.controller";
import { RETAIL_EMPLOYEE_SALARY_COMPONENTS_TYPES } from "./employeeSalaryComponents.types";
import { employeeSalaryComponentsBodySchema, employeeSalaryComponentsIdParamsSchema, employeeSalaryComponentsQuerySchema } from "./employeeSalaryComponents.validator";

@injectable()
export class RetailEmployeeSalaryComponentsRouter {
  private router: Router;

  constructor(@inject(RETAIL_EMPLOYEE_SALARY_COMPONENTS_TYPES.Controller) private employeeSalaryComponentsController: RetailEmployeeSalaryComponentsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "employee-salary-components": ["read"] }),
      zodValidate(employeeSalaryComponentsQuerySchema, "query"),
      this.employeeSalaryComponentsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "employee-salary-components": ["create"] }),
      zodValidate(employeeSalaryComponentsBodySchema, "body"),
      this.employeeSalaryComponentsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "employee-salary-components": ["read"] }),
      zodValidate(employeeSalaryComponentsIdParamsSchema, "params"),
      this.employeeSalaryComponentsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "employee-salary-components": ["update"] }),
      zodValidate(employeeSalaryComponentsIdParamsSchema, "params"),
      zodValidate(employeeSalaryComponentsBodySchema, "body"),
      this.employeeSalaryComponentsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "employee-salary-components": ["delete"] }),
      zodValidate(employeeSalaryComponentsIdParamsSchema, "params"),
      this.employeeSalaryComponentsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
