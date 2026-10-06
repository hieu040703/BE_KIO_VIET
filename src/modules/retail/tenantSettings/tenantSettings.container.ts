import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailTenantSettingsController } from "./tenantSettings.controller";
import { RetailTenantSettingsRepository } from "./tenantSettings.repository";
import { RetailTenantSettingsRouter } from "./tenantSettings.route";
import { RetailTenantSettingsService } from "./tenantSettings.service";
import { RETAIL_TENANT_SETTINGS_TYPES } from "./tenantSettings.types";

export const tenantSettingsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailTenantSettingsRepository>(RETAIL_TENANT_SETTINGS_TYPES.Repository).to(RetailTenantSettingsRepository);
  options.bind<RetailTenantSettingsService>(RETAIL_TENANT_SETTINGS_TYPES.Service).to(RetailTenantSettingsService);
  options.bind<RetailTenantSettingsController>(RETAIL_TENANT_SETTINGS_TYPES.Controller).to(RetailTenantSettingsController);
  options.bind<RetailTenantSettingsRouter>(RETAIL_TENANT_SETTINGS_TYPES.Router).to(RetailTenantSettingsRouter);
});
