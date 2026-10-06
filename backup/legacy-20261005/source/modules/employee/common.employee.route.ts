import { Router } from "express";
import { injectable, inject } from "inversify";
import { EmployeeController } from "./employee.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { EmployeeParamsSchema } from "./employee.validator";
import { EMPLOYEE_TYPES } from "./employee.types";

@injectable()
export class CommonEmployeeRouter {
  private router: Router;

  constructor(@inject(EMPLOYEE_TYPES.EmployeeController) private employeeController: EmployeeController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /employees/:id - Get employee by ID
    this.router.get(
      "/:id",
      zodValidate(EmployeeParamsSchema, "params"),
      this.employeeController.getById,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
