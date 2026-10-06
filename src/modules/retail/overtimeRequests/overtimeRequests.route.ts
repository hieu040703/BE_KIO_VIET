import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailOvertimeRequestsController } from "./overtimeRequests.controller";
import { RETAIL_OVERTIME_REQUESTS_TYPES } from "./overtimeRequests.types";
import { overtimeRequestsBodySchema, overtimeRequestsIdParamsSchema, overtimeRequestsQuerySchema } from "./overtimeRequests.validator";

@injectable()
export class RetailOvertimeRequestsRouter {
  private router: Router;

  constructor(@inject(RETAIL_OVERTIME_REQUESTS_TYPES.Controller) private overtimeRequestsController: RetailOvertimeRequestsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "overtime-requests": ["read"] }),
      zodValidate(overtimeRequestsQuerySchema, "query"),
      this.overtimeRequestsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "overtime-requests": ["create"] }),
      zodValidate(overtimeRequestsBodySchema, "body"),
      this.overtimeRequestsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "overtime-requests": ["read"] }),
      zodValidate(overtimeRequestsIdParamsSchema, "params"),
      this.overtimeRequestsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "overtime-requests": ["update"] }),
      zodValidate(overtimeRequestsIdParamsSchema, "params"),
      zodValidate(overtimeRequestsBodySchema, "body"),
      this.overtimeRequestsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "overtime-requests": ["delete"] }),
      zodValidate(overtimeRequestsIdParamsSchema, "params"),
      this.overtimeRequestsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
