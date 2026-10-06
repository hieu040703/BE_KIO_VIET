import { Router } from "express";
import { injectable, inject } from "inversify";
import { EmployeeController } from "./employee.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  EmployeeQuerySchema,
  EmployeeParamsSchema,
  UserIdParamsSchema,
} from "./employee.validator";
import { EMPLOYEE_TYPES } from "./employee.types";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class EmployeeRouter {
  private router: Router;

  constructor(@inject(EMPLOYEE_TYPES.EmployeeController) private employeeController: EmployeeController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All employee routes require authentication
    // this.router.use(authenticate);

    // GET /employees - Get all employees with filters
    this.router.get(
      "/",
      permissionMiddleware({ employee: ["read"] }),
      zodValidate(EmployeeQuerySchema, "query"),
      this.employeeController.getAllWithPagination,
    );

    // GET /employees/find-by-user-id/:userId - Get all employees with filters
    this.router.get(
      "/find-by-user-id/:userId",
      permissionMiddleware({ employee: ["read"] }),
      zodValidate(EmployeeQuerySchema, "query"),
      this.employeeController.findByUserId,
    );

    // POST /employees - Create new employee
    this.router.post(
      "/",
      permissionMiddleware({ employee: ["create"] }),
      zodValidate(CreateEmployeeSchema, "body"),
      this.employeeController.create,
    );

    // GET /employees/:id - Get employee by ID
    this.router.get(
      "/:id",
      permissionMiddleware({ employee: ["read"] }),
      zodValidate(EmployeeParamsSchema, "params"),
      this.employeeController.getById,
    );

    // PUT /employees/:id - Update employee
    this.router.put(
      "/:id",
      permissionMiddleware({ employee: ["update"] }),
      zodValidate(EmployeeParamsSchema, "params"),
      zodValidate(UpdateEmployeeSchema, "body"),
      this.employeeController.update,
    );

    // DELETE /employees/:id - Delete employee
    this.router.delete(
      "/:id",
      permissionMiddleware({ employee: ["delete"] }),
      zodValidate(EmployeeParamsSchema, "params"),
      this.employeeController.delete,
    );

    // GET /employees/user/:userId - Get employee by userId
    this.router.get(
      "/user/:userId",
      permissionMiddleware({ employee: ["read"] }),
      zodValidate(UserIdParamsSchema, "params"),
      this.employeeController.findByUserId,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
