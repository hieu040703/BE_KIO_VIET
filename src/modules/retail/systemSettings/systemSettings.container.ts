import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailSystemSettingsController } from "./systemSettings.controller";
import { RetailSystemSettingsRepository } from "./systemSettings.repository";
import { RetailSystemSettingsRouter } from "./systemSettings.route";
import { RetailSystemSettingsService } from "./systemSettings.service";
import { RETAIL_SYSTEM_SETTINGS_TYPES } from "./systemSettings.types";

export const systemSettingsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailSystemSettingsRepository>(RETAIL_SYSTEM_SETTINGS_TYPES.Repository).to(RetailSystemSettingsRepository);
  options.bind<RetailSystemSettingsService>(RETAIL_SYSTEM_SETTINGS_TYPES.Service).to(RetailSystemSettingsService);
  options.bind<RetailSystemSettingsController>(RETAIL_SYSTEM_SETTINGS_TYPES.Controller).to(RetailSystemSettingsController);
  options.bind<RetailSystemSettingsRouter>(RETAIL_SYSTEM_SETTINGS_TYPES.Router).to(RetailSystemSettingsRouter);
});
