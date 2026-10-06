import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailInventoryBatchesController } from "./inventoryBatches.controller";
import { RetailInventoryBatchesRepository } from "./inventoryBatches.repository";
import { RetailInventoryBatchesRouter } from "./inventoryBatches.route";
import { RetailInventoryBatchesService } from "./inventoryBatches.service";
import { RETAIL_INVENTORY_BATCHES_TYPES } from "./inventoryBatches.types";

export const inventoryBatchesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailInventoryBatchesRepository>(RETAIL_INVENTORY_BATCHES_TYPES.Repository).to(RetailInventoryBatchesRepository);
  options.bind<RetailInventoryBatchesService>(RETAIL_INVENTORY_BATCHES_TYPES.Service).to(RetailInventoryBatchesService);
  options.bind<RetailInventoryBatchesController>(RETAIL_INVENTORY_BATCHES_TYPES.Controller).to(RetailInventoryBatchesController);
  options.bind<RetailInventoryBatchesRouter>(RETAIL_INVENTORY_BATCHES_TYPES.Router).to(RetailInventoryBatchesRouter);
});
