import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailEmployeesController } from "./employees.controller";
import { RETAIL_EMPLOYEES_TYPES } from "./employees.types";
import { employeesBodySchema, employeesIdParamsSchema, employeesQuerySchema } from "./employees.validator";

@injectable()
export class RetailEmployeesRouter {
  private router: Router;

  constructor(@inject(RETAIL_EMPLOYEES_TYPES.Controller) private employeesController: RetailEmployeesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "employees": ["read"] }),
      zodValidate(employeesQuerySchema, "query"),
      this.employeesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "employees": ["create"] }),
      zodValidate(employeesBodySchema, "body"),
      this.employeesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "employees": ["read"] }),
      zodValidate(employeesIdParamsSchema, "params"),
      this.employeesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "employees": ["update"] }),
      zodValidate(employeesIdParamsSchema, "params"),
      zodValidate(employeesBodySchema, "body"),
      this.employeesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "employees": ["delete"] }),
      zodValidate(employeesIdParamsSchema, "params"),
      this.employeesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
