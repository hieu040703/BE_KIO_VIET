import { Router } from "express";
import { inject, injectable } from "inversify";
import { zodValidate } from "@/shared/middleware/validation.middleware";
import { permissionMiddleware } from "@/shared/middleware/permission.middleware";
import { RetailSystemSettingsController } from "./systemSettings.controller";
import { RETAIL_SYSTEM_SETTINGS_TYPES } from "./systemSettings.types";
import { systemSettingsBodySchema, systemSettingsIdParamsSchema, systemSettingsQuerySchema } from "./systemSettings.validator";

@injectable()
export class RetailSystemSettingsRouter {
  private router: Router;

  constructor(@inject(RETAIL_SYSTEM_SETTINGS_TYPES.Controller) private systemSettingsController: RetailSystemSettingsController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      permissionMiddleware({ "system-settings": ["read"] }),
      zodValidate(systemSettingsQuerySchema, "query"),
      this.systemSettingsController.getAllWithPagination,
    );
    this.router.post(
      "/",
      permissionMiddleware({ "system-settings": ["create"] }),
      zodValidate(systemSettingsBodySchema, "body"),
      this.systemSettingsController.create,
    );
    this.router.get(
      "/:id",
      permissionMiddleware({ "system-settings": ["read"] }),
      zodValidate(systemSettingsIdParamsSchema, "params"),
      this.systemSettingsController.getById,
    );
    this.router.put(
      "/:id",
      permissionMiddleware({ "system-settings": ["update"] }),
      zodValidate(systemSettingsIdParamsSchema, "params"),
      zodValidate(systemSettingsBodySchema, "body"),
      this.systemSettingsController.update,
    );
    this.router.delete(
      "/:id",
      permissionMiddleware({ "system-settings": ["delete"] }),
      zodValidate(systemSettingsIdParamsSchema, "params"),
      this.systemSettingsController.delete,
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
