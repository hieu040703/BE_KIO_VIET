import { Router } from "express";
import { injectable, inject } from "inversify";
import { AppSettingController } from "./appSetting.controller";
import { zodValidate } from "@/shared/middleware/validation.middleware";

import {
  CreateAppSettingSchema,
  UpdateAppSettingSchema,
  AppSettingQuerySchema,
  AppSettingParamsSchema,
} from "./appSetting.validator";
import { APP_SETTING_TYPES } from "./appSetting.types";

@injectable()
export class AppSettingRouter {
  private router: Router;

  constructor(@inject(APP_SETTING_TYPES.AppSettingController) private appSettingController: AppSettingController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All appSetting routes require authentication
    // this.router.use(authenticate);

    // GET /appSettings - Get all appSettings with filters
    this.router.get("/", zodValidate(AppSettingQuerySchema, "query"), this.appSettingController.getAllWithPagination);

    // POST /appSettings - Create new appSetting
    this.router.post("/", zodValidate(CreateAppSettingSchema, "body"), this.appSettingController.create);

    // GET /appSettings/vat - Get vat appSetting
    this.router.get("/vat", this.appSettingController.getVatAppSetting);

    // GET /appSettings/:id - Get appSetting by ID
    this.router.get("/:id", zodValidate(AppSettingParamsSchema, "params"), this.appSettingController.getById);

    // PUT /appSettings/:id - Update appSetting
    this.router.put(
      "/:id",
      zodValidate(AppSettingParamsSchema, "params"),
      zodValidate(UpdateAppSettingSchema, "body"),
      this.appSettingController.update,
    );

    // DELETE /appSettings/:id - Delete appSetting
    this.router.delete("/:id", zodValidate(AppSettingParamsSchema, "params"), this.appSettingController.delete);
  }

  public getRouter(): Router {
    return this.router;
  }
}
