import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailEmployeeProfilesController } from "./employeeProfiles.controller";
import { RETAIL_EMPLOYEE_PROFILES_TYPES } from "./employeeProfiles.types";
import { employeeProfilesBodySchema, employeeProfilesIdParamsSchema, employeeProfilesQuerySchema } from "./employeeProfiles.validator";

@injectable()
export class RetailEmployeeProfilesRouter {
  private router: Router;

  constructor(@inject(RETAIL_EMPLOYEE_PROFILES_TYPES.Controller) private employeeProfilesController: RetailEmployeeProfilesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "employee-profiles": ["read"] }),
      zodValidate(employeeProfilesQuerySchema, "query"),
      this.employeeProfilesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "employee-profiles": ["create"] }),
      zodValidate(employeeProfilesBodySchema, "body"),
      this.employeeProfilesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "employee-profiles": ["read"] }),
      zodValidate(employeeProfilesIdParamsSchema, "params"),
      this.employeeProfilesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "employee-profiles": ["update"] }),
      zodValidate(employeeProfilesIdParamsSchema, "params"),
      zodValidate(employeeProfilesBodySchema, "body"),
      this.employeeProfilesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "employee-profiles": ["delete"] }),
      zodValidate(employeeProfilesIdParamsSchema, "params"),
      this.employeeProfilesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
