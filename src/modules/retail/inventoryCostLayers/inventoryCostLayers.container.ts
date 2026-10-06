import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailInventoryCostLayersController } from "./inventoryCostLayers.controller";
import { RetailInventoryCostLayersRepository } from "./inventoryCostLayers.repository";
import { RetailInventoryCostLayersRouter } from "./inventoryCostLayers.route";
import { RetailInventoryCostLayersService } from "./inventoryCostLayers.service";
import { RETAIL_INVENTORY_COST_LAYERS_TYPES } from "./inventoryCostLayers.types";

export const inventoryCostLayersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailInventoryCostLayersRepository>(RETAIL_INVENTORY_COST_LAYERS_TYPES.Repository).to(RetailInventoryCostLayersRepository);
  options.bind<RetailInventoryCostLayersService>(RETAIL_INVENTORY_COST_LAYERS_TYPES.Service).to(RetailInventoryCostLayersService);
  options.bind<RetailInventoryCostLayersController>(RETAIL_INVENTORY_COST_LAYERS_TYPES.Controller).to(RetailInventoryCostLayersController);
  options.bind<RetailInventoryCostLayersRouter>(RETAIL_INVENTORY_COST_LAYERS_TYPES.Router).to(RetailInventoryCostLayersRouter);
});
