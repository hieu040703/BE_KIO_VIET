import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailEmployeeBranchAssignmentsController } from "./employeeBranchAssignments.controller";
import { RETAIL_EMPLOYEE_BRANCH_ASSIGNMENTS_TYPES } from "./employeeBranchAssignments.types";
import { employeeBranchAssignmentsBodySchema, employeeBranchAssignmentsIdParamsSchema, employeeBranchAssignmentsQuerySchema } from "./employeeBranchAssignments.validator";

@injectable()
export class RetailEmployeeBranchAssignmentsRouter {
  private router: Router;

  constructor(@inject(RETAIL_EMPLOYEE_BRANCH_ASSIGNMENTS_TYPES.Controller) private employeeBranchAssignmentsController: RetailEmployeeBranchAssignmentsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "employee-branch-assignments": ["read"] }),
      zodValidate(employeeBranchAssignmentsQuerySchema, "query"),
      this.employeeBranchAssignmentsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "employee-branch-assignments": ["create"] }),
      zodValidate(employeeBranchAssignmentsBodySchema, "body"),
      this.employeeBranchAssignmentsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "employee-branch-assignments": ["read"] }),
      zodValidate(employeeBranchAssignmentsIdParamsSchema, "params"),
      this.employeeBranchAssignmentsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "employee-branch-assignments": ["update"] }),
      zodValidate(employeeBranchAssignmentsIdParamsSchema, "params"),
      zodValidate(employeeBranchAssignmentsBodySchema, "body"),
      this.employeeBranchAssignmentsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "employee-branch-assignments": ["delete"] }),
      zodValidate(employeeBranchAssignmentsIdParamsSchema, "params"),
      this.employeeBranchAssignmentsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
