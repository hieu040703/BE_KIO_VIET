import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailApiKeysController } from "./apiKeys.controller";
import { RetailApiKeysRepository } from "./apiKeys.repository";
import { RetailApiKeysRouter } from "./apiKeys.route";
import { RetailApiKeysService } from "./apiKeys.service";
import { RETAIL_API_KEYS_TYPES } from "./apiKeys.types";

export const apiKeysModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailApiKeysRepository>(RETAIL_API_KEYS_TYPES.Repository).to(RetailApiKeysRepository);
  options.bind<RetailApiKeysService>(RETAIL_API_KEYS_TYPES.Service).to(RetailApiKeysService);
  options.bind<RetailApiKeysController>(RETAIL_API_KEYS_TYPES.Controller).to(RetailApiKeysController);
  options.bind<RetailApiKeysRouter>(RETAIL_API_KEYS_TYPES.Router).to(RetailApiKeysRouter);
});
