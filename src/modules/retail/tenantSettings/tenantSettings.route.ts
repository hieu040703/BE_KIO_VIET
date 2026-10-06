import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailTenantSettingsController } from "./tenantSettings.controller";
import { RETAIL_TENANT_SETTINGS_TYPES } from "./tenantSettings.types";
import { tenantSettingsBodySchema, tenantSettingsIdParamsSchema, tenantSettingsQuerySchema } from "./tenantSettings.validator";

@injectable()
export class RetailTenantSettingsRouter {
  private router: Router;

  constructor(@inject(RETAIL_TENANT_SETTINGS_TYPES.Controller) private tenantSettingsController: RetailTenantSettingsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "tenant-settings": ["read"] }),
      zodValidate(tenantSettingsQuerySchema, "query"),
      this.tenantSettingsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "tenant-settings": ["create"] }),
      zodValidate(tenantSettingsBodySchema, "body"),
      this.tenantSettingsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "tenant-settings": ["read"] }),
      zodValidate(tenantSettingsIdParamsSchema, "params"),
      this.tenantSettingsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "tenant-settings": ["update"] }),
      zodValidate(tenantSettingsIdParamsSchema, "params"),
      zodValidate(tenantSettingsBodySchema, "body"),
      this.tenantSettingsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "tenant-settings": ["delete"] }),
      zodValidate(tenantSettingsIdParamsSchema, "params"),
      this.tenantSettingsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
