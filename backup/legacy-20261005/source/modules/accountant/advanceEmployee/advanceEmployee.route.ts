import { Router } from "express";
import { injectable, inject } from "inversify";
import { AdvanceEmployeeController } from "./advanceEmployee.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateAdvanceEmployeeSchema,
  UpdateAdvanceEmployeeSchema,
  AdvanceEmployeeQuerySchema,
  AdvanceEmployeeParamsSchema,
  GetAdvanceEmployeeSummarySchema,
} from "./advanceEmployee.validator";
import { ADVANCE_EMPLOYEE_TYPES } from "./advanceEmployee.types";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";

@injectable()
export class AdvanceEmployeeRouter {
  private router: Router;

  constructor(
    @inject(ADVANCE_EMPLOYEE_TYPES.AdvanceEmployeeController)
    private advanceEmployeeController: AdvanceEmployeeController,
  ) {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All advanceEmployee routes require authentication
    // this.router.use(authenticate);

    // GET /advanceEmployees/summary - Get advanceEmployee summary
    this.router.get(
      "/summary",
      permissionMiddleware({ advanceEmployee: ["read"] }),
      zodValidate(GetAdvanceEmployeeSummarySchema, "query"),
      this.advanceEmployeeController.getAdvanceEmployeeSummary,
    );

    // GET /advanceEmployees - Get all advanceEmployees with filters
    this.router.get(
      "/",
      permissionMiddleware({ advanceEmployee: ["read"] }),
      zodValidate(AdvanceEmployeeQuerySchema, "query"),
      this.advanceEmployeeController.getAllWithPagination,
    );

    // POST /advanceEmployees - Create new advanceEmployee
    this.router.post(
      "/",
      permissionMiddleware({ advanceEmployee: ["create"] }),
      zodValidate(CreateAdvanceEmployeeSchema, "body"),
      this.advanceEmployeeController.create,
    );

    // GET /advanceEmployees/:id - Get advanceEmployee by ID
    this.router.get(
      "/:id",
      permissionMiddleware({ advanceEmployee: ["read"] }),
      zodValidate(AdvanceEmployeeParamsSchema, "params"),
      this.advanceEmployeeController.getById,
    );

    // PUT /advanceEmployees/:id - Update advanceEmployee
    this.router.put(
      "/:id",
      permissionMiddleware({ advanceEmployee: ["update"] }),
      zodValidate(AdvanceEmployeeParamsSchema, "params"),
      zodValidate(UpdateAdvanceEmployeeSchema, "body"),
      this.advanceEmployeeController.update,
    );

    // DELETE /advanceEmployees/:id - Delete advanceEmployee
    this.router.delete(
      "/:id",
      permissionMiddleware({ advanceEmployee: ["delete"] }),
      zodValidate(AdvanceEmployeeParamsSchema, "params"),
      this.advanceEmployeeController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
