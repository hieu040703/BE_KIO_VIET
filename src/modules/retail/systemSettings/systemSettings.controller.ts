import { injectable, inject } from "inversify";
import { RetailSystemSettingsService } from "./systemSettings.service";
import { RETAIL_SYSTEM_SETTINGS_TYPES } from "./systemSettings.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailSystemSettingsController extends BaseController<RetailSystemSettingsService> {
  constructor(@inject(RETAIL_SYSTEM_SETTINGS_TYPES.Service) protected service: RetailSystemSettingsService) {
    super(service);
  }
}
