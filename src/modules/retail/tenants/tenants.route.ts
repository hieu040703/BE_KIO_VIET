import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailTenantsController } from "./tenants.controller";
import { RETAIL_TENANTS_TYPES } from "./tenants.types";
import { tenantsBodySchema, tenantsIdParamsSchema, tenantsQuerySchema } from "./tenants.validator";

@injectable()
export class RetailTenantsRouter {
  private router: Router;

  constructor(@inject(RETAIL_TENANTS_TYPES.Controller) private tenantsController: RetailTenantsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "tenants": ["read"] }),
      zodValidate(tenantsQuerySchema, "query"),
      this.tenantsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "tenants": ["create"] }),
      zodValidate(tenantsBodySchema, "body"),
      this.tenantsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "tenants": ["read"] }),
      zodValidate(tenantsIdParamsSchema, "params"),
      this.tenantsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "tenants": ["update"] }),
      zodValidate(tenantsIdParamsSchema, "params"),
      zodValidate(tenantsBodySchema, "body"),
      this.tenantsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "tenants": ["delete"] }),
      zodValidate(tenantsIdParamsSchema, "params"),
      this.tenantsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
