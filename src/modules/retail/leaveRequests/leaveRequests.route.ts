import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailLeaveRequestsController } from "./leaveRequests.controller";
import { RETAIL_LEAVE_REQUESTS_TYPES } from "./leaveRequests.types";
import { leaveRequestsBodySchema, leaveRequestsIdParamsSchema, leaveRequestsQuerySchema } from "./leaveRequests.validator";

@injectable()
export class RetailLeaveRequestsRouter {
  private router: Router;

  constructor(@inject(RETAIL_LEAVE_REQUESTS_TYPES.Controller) private leaveRequestsController: RetailLeaveRequestsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "leave-requests": ["read"] }),
      zodValidate(leaveRequestsQuerySchema, "query"),
      this.leaveRequestsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "leave-requests": ["create"] }),
      zodValidate(leaveRequestsBodySchema, "body"),
      this.leaveRequestsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "leave-requests": ["read"] }),
      zodValidate(leaveRequestsIdParamsSchema, "params"),
      this.leaveRequestsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "leave-requests": ["update"] }),
      zodValidate(leaveRequestsIdParamsSchema, "params"),
      zodValidate(leaveRequestsBodySchema, "body"),
      this.leaveRequestsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "leave-requests": ["delete"] }),
      zodValidate(leaveRequestsIdParamsSchema, "params"),
      this.leaveRequestsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
