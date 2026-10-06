import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailKpiDefinitionsController } from "./kpiDefinitions.controller";
import { RETAIL_KPI_DEFINITIONS_TYPES } from "./kpiDefinitions.types";
import { kpiDefinitionsBodySchema, kpiDefinitionsIdParamsSchema, kpiDefinitionsQuerySchema } from "./kpiDefinitions.validator";

@injectable()
export class RetailKpiDefinitionsRouter {
  private router: Router;

  constructor(@inject(RETAIL_KPI_DEFINITIONS_TYPES.Controller) private kpiDefinitionsController: RetailKpiDefinitionsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "kpi-definitions": ["read"] }),
      zodValidate(kpiDefinitionsQuerySchema, "query"),
      this.kpiDefinitionsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "kpi-definitions": ["create"] }),
      zodValidate(kpiDefinitionsBodySchema, "body"),
      this.kpiDefinitionsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "kpi-definitions": ["read"] }),
      zodValidate(kpiDefinitionsIdParamsSchema, "params"),
      this.kpiDefinitionsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "kpi-definitions": ["update"] }),
      zodValidate(kpiDefinitionsIdParamsSchema, "params"),
      zodValidate(kpiDefinitionsBodySchema, "body"),
      this.kpiDefinitionsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "kpi-definitions": ["delete"] }),
      zodValidate(kpiDefinitionsIdParamsSchema, "params"),
      this.kpiDefinitionsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
