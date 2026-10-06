import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailStockAdjustmentItemsController } from "./stockAdjustmentItems.controller";
import { RetailStockAdjustmentItemsRepository } from "./stockAdjustmentItems.repository";
import { RetailStockAdjustmentItemsRouter } from "./stockAdjustmentItems.route";
import { RetailStockAdjustmentItemsService } from "./stockAdjustmentItems.service";
import { RETAIL_STOCK_ADJUSTMENT_ITEMS_TYPES } from "./stockAdjustmentItems.types";

export const stockAdjustmentItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailStockAdjustmentItemsRepository>(RETAIL_STOCK_ADJUSTMENT_ITEMS_TYPES.Repository).to(RetailStockAdjustmentItemsRepository);
  options.bind<RetailStockAdjustmentItemsService>(RETAIL_STOCK_ADJUSTMENT_ITEMS_TYPES.Service).to(RetailStockAdjustmentItemsService);
  options.bind<RetailStockAdjustmentItemsController>(RETAIL_STOCK_ADJUSTMENT_ITEMS_TYPES.Controller).to(RetailStockAdjustmentItemsController);
  options.bind<RetailStockAdjustmentItemsRouter>(RETAIL_STOCK_ADJUSTMENT_ITEMS_TYPES.Router).to(RetailStockAdjustmentItemsRouter);
});
