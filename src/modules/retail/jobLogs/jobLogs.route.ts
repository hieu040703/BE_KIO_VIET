import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailJobLogsController } from "./jobLogs.controller";
import { RETAIL_JOB_LOGS_TYPES } from "./jobLogs.types";
import { jobLogsBodySchema, jobLogsIdParamsSchema, jobLogsQuerySchema } from "./jobLogs.validator";

@injectable()
export class RetailJobLogsRouter {
  private router: Router;

  constructor(@inject(RETAIL_JOB_LOGS_TYPES.Controller) private jobLogsController: RetailJobLogsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "job-logs": ["read"] }),
      zodValidate(jobLogsQuerySchema, "query"),
      this.jobLogsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "job-logs": ["create"] }),
      zodValidate(jobLogsBodySchema, "body"),
      this.jobLogsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "job-logs": ["read"] }),
      zodValidate(jobLogsIdParamsSchema, "params"),
      this.jobLogsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "job-logs": ["update"] }),
      zodValidate(jobLogsIdParamsSchema, "params"),
      zodValidate(jobLogsBodySchema, "body"),
      this.jobLogsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "job-logs": ["delete"] }),
      zodValidate(jobLogsIdParamsSchema, "params"),
      this.jobLogsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
