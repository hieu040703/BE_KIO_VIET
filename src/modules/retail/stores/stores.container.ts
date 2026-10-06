import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailStoresController } from "./stores.controller";
import { RetailStoresRepository } from "./stores.repository";
import { RetailStoresRouter } from "./stores.route";
import { RetailStoresService } from "./stores.service";
import { RETAIL_STORES_TYPES } from "./stores.types";

export const storesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailStoresRepository>(RETAIL_STORES_TYPES.Repository).to(RetailStoresRepository);
  options.bind<RetailStoresService>(RETAIL_STORES_TYPES.Service).to(RetailStoresService);
  options.bind<RetailStoresController>(RETAIL_STORES_TYPES.Controller).to(RetailStoresController);
  options.bind<RetailStoresRouter>(RETAIL_STORES_TYPES.Router).to(RetailStoresRouter);
});
