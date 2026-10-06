import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailInventoriesController } from "./inventories.controller";
import { RetailInventoriesRepository } from "./inventories.repository";
import { RetailInventoriesRouter } from "./inventories.route";
import { RetailInventoriesService } from "./inventories.service";
import { RETAIL_INVENTORIES_TYPES } from "./inventories.types";

export const inventoriesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailInventoriesRepository>(RETAIL_INVENTORIES_TYPES.Repository).to(RetailInventoriesRepository);
  options.bind<RetailInventoriesService>(RETAIL_INVENTORIES_TYPES.Service).to(RetailInventoriesService);
  options.bind<RetailInventoriesController>(RETAIL_INVENTORIES_TYPES.Controller).to(RetailInventoriesController);
  options.bind<RetailInventoriesRouter>(RETAIL_INVENTORIES_TYPES.Router).to(RetailInventoriesRouter);
});
