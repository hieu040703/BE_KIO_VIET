import { injectable, inject } from "inversify";
import { RetailTenantSettingsService } from "./tenantSettings.service";
import { RETAIL_TENANT_SETTINGS_TYPES } from "./tenantSettings.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailTenantSettingsController extends BaseController<RetailTenantSettingsService> {
  constructor(@inject(RETAIL_TENANT_SETTINGS_TYPES.Service) protected service: RetailTenantSettingsService) {
    super(service);
  }
}
