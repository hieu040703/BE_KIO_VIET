import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailEmployeeKpisController } from "./employeeKpis.controller";
import { RETAIL_EMPLOYEE_KPIS_TYPES } from "./employeeKpis.types";
import { employeeKpisBodySchema, employeeKpisIdParamsSchema, employeeKpisQuerySchema } from "./employeeKpis.validator";

@injectable()
export class RetailEmployeeKpisRouter {
  private router: Router;

  constructor(@inject(RETAIL_EMPLOYEE_KPIS_TYPES.Controller) private employeeKpisController: RetailEmployeeKpisController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "employee-kpis": ["read"] }),
      zodValidate(employeeKpisQuerySchema, "query"),
      this.employeeKpisController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "employee-kpis": ["create"] }),
      zodValidate(employeeKpisBodySchema, "body"),
      this.employeeKpisController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "employee-kpis": ["read"] }),
      zodValidate(employeeKpisIdParamsSchema, "params"),
      this.employeeKpisController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "employee-kpis": ["update"] }),
      zodValidate(employeeKpisIdParamsSchema, "params"),
      zodValidate(employeeKpisBodySchema, "body"),
      this.employeeKpisController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "employee-kpis": ["delete"] }),
      zodValidate(employeeKpisIdParamsSchema, "params"),
      this.employeeKpisController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
