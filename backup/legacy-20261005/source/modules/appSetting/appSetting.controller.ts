import { injectable, inject } from "inversify";
import { AppSettingService } from "./appSetting.service";
import { APP_SETTING_TYPES } from "./appSetting.types";
import { BaseController } from "@/shared/base/BaseController";
import { NextFunction, Request, Response } from "express";

@injectable()
export class AppSettingController extends BaseController<AppSettingService> {
  constructor(@inject(APP_SETTING_TYPES.AppSettingService) protected service: AppSettingService) {
    super(service);
  }

  getVatAppSetting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getVatAppSetting();
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };
}
