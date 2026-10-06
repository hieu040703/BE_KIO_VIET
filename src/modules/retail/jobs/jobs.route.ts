import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailJobsController } from "./jobs.controller";
import { RETAIL_JOBS_TYPES } from "./jobs.types";
import { jobsBodySchema, jobsIdParamsSchema, jobsQuerySchema } from "./jobs.validator";

@injectable()
export class RetailJobsRouter {
  private router: Router;

  constructor(@inject(RETAIL_JOBS_TYPES.Controller) private jobsController: RetailJobsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "jobs": ["read"] }),
      zodValidate(jobsQuerySchema, "query"),
      this.jobsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "jobs": ["create"] }),
      zodValidate(jobsBodySchema, "body"),
      this.jobsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "jobs": ["read"] }),
      zodValidate(jobsIdParamsSchema, "params"),
      this.jobsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "jobs": ["update"] }),
      zodValidate(jobsIdParamsSchema, "params"),
      zodValidate(jobsBodySchema, "body"),
      this.jobsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "jobs": ["delete"] }),
      zodValidate(jobsIdParamsSchema, "params"),
      this.jobsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
