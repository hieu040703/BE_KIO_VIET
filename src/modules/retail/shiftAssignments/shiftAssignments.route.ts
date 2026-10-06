import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailShiftAssignmentsController } from "./shiftAssignments.controller";
import { RETAIL_SHIFT_ASSIGNMENTS_TYPES } from "./shiftAssignments.types";
import { shiftAssignmentsBodySchema, shiftAssignmentsIdParamsSchema, shiftAssignmentsQuerySchema } from "./shiftAssignments.validator";

@injectable()
export class RetailShiftAssignmentsRouter {
  private router: Router;

  constructor(@inject(RETAIL_SHIFT_ASSIGNMENTS_TYPES.Controller) private shiftAssignmentsController: RetailShiftAssignmentsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "shift-assignments": ["read"] }),
      zodValidate(shiftAssignmentsQuerySchema, "query"),
      this.shiftAssignmentsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "shift-assignments": ["create"] }),
      zodValidate(shiftAssignmentsBodySchema, "body"),
      this.shiftAssignmentsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "shift-assignments": ["read"] }),
      zodValidate(shiftAssignmentsIdParamsSchema, "params"),
      this.shiftAssignmentsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "shift-assignments": ["update"] }),
      zodValidate(shiftAssignmentsIdParamsSchema, "params"),
      zodValidate(shiftAssignmentsBodySchema, "body"),
      this.shiftAssignmentsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "shift-assignments": ["delete"] }),
      zodValidate(shiftAssignmentsIdParamsSchema, "params"),
      this.shiftAssignmentsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
