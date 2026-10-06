import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailTenantSettings } from "@/database/models/retail/RetailGenericEntities";
import { RetailTenantSettingsRepository } from "./tenantSettings.repository";
import { RETAIL_TENANT_SETTINGS_TYPES } from "./tenantSettings.types";

@injectable()
export class RetailTenantSettingsService extends BaseService<RetailTenantSettings> {
  constructor(@inject(RETAIL_TENANT_SETTINGS_TYPES.Repository) repository: RetailTenantSettingsRepository) {
    super(repository);
  }
}
