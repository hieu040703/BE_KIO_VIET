import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailEmployeePositionHistoryController } from "./employeePositionHistory.controller";
import { RETAIL_EMPLOYEE_POSITION_HISTORY_TYPES } from "./employeePositionHistory.types";
import { employeePositionHistoryBodySchema, employeePositionHistoryIdParamsSchema, employeePositionHistoryQuerySchema } from "./employeePositionHistory.validator";

@injectable()
export class RetailEmployeePositionHistoryRouter {
  private router: Router;

  constructor(@inject(RETAIL_EMPLOYEE_POSITION_HISTORY_TYPES.Controller) private employeePositionHistoryController: RetailEmployeePositionHistoryController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "employee-position-history": ["read"] }),
      zodValidate(employeePositionHistoryQuerySchema, "query"),
      this.employeePositionHistoryController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "employee-position-history": ["create"] }),
      zodValidate(employeePositionHistoryBodySchema, "body"),
      this.employeePositionHistoryController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "employee-position-history": ["read"] }),
      zodValidate(employeePositionHistoryIdParamsSchema, "params"),
      this.employeePositionHistoryController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "employee-position-history": ["update"] }),
      zodValidate(employeePositionHistoryIdParamsSchema, "params"),
      zodValidate(employeePositionHistoryBodySchema, "body"),
      this.employeePositionHistoryController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "employee-position-history": ["delete"] }),
      zodValidate(employeePositionHistoryIdParamsSchema, "params"),
      this.employeePositionHistoryController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
