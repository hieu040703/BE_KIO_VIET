import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailLeaveTypesController } from "./leaveTypes.controller";
import { RETAIL_LEAVE_TYPES_TYPES } from "./leaveTypes.types";
import { leaveTypesBodySchema, leaveTypesIdParamsSchema, leaveTypesQuerySchema } from "./leaveTypes.validator";

@injectable()
export class RetailLeaveTypesRouter {
  private router: Router;

  constructor(@inject(RETAIL_LEAVE_TYPES_TYPES.Controller) private leaveTypesController: RetailLeaveTypesController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "leave-types": ["read"] }),
      zodValidate(leaveTypesQuerySchema, "query"),
      this.leaveTypesController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "leave-types": ["create"] }),
      zodValidate(leaveTypesBodySchema, "body"),
      this.leaveTypesController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "leave-types": ["read"] }),
      zodValidate(leaveTypesIdParamsSchema, "params"),
      this.leaveTypesController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "leave-types": ["update"] }),
      zodValidate(leaveTypesIdParamsSchema, "params"),
      zodValidate(leaveTypesBodySchema, "body"),
      this.leaveTypesController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "leave-types": ["delete"] }),
      zodValidate(leaveTypesIdParamsSchema, "params"),
      this.leaveTypesController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
