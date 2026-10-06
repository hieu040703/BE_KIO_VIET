import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailWarehousesController } from "./warehouses.controller";
import { RetailWarehousesRepository } from "./warehouses.repository";
import { RetailWarehousesRouter } from "./warehouses.route";
import { RetailWarehousesService } from "./warehouses.service";
import { RETAIL_WAREHOUSES_TYPES } from "./warehouses.types";

export const warehousesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailWarehousesRepository>(RETAIL_WAREHOUSES_TYPES.Repository).to(RetailWarehousesRepository);
  options.bind<RetailWarehousesService>(RETAIL_WAREHOUSES_TYPES.Service).to(RetailWarehousesService);
  options.bind<RetailWarehousesController>(RETAIL_WAREHOUSES_TYPES.Controller).to(RetailWarehousesController);
  options.bind<RetailWarehousesRouter>(RETAIL_WAREHOUSES_TYPES.Router).to(RetailWarehousesRouter);
});
