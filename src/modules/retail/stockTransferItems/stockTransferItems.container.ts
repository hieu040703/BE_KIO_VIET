import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailStockTransferItemsController } from "./stockTransferItems.controller";
import { RetailStockTransferItemsRepository } from "./stockTransferItems.repository";
import { RetailStockTransferItemsRouter } from "./stockTransferItems.route";
import { RetailStockTransferItemsService } from "./stockTransferItems.service";
import { RETAIL_STOCK_TRANSFER_ITEMS_TYPES } from "./stockTransferItems.types";

export const stockTransferItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailStockTransferItemsRepository>(RETAIL_STOCK_TRANSFER_ITEMS_TYPES.Repository).to(RetailStockTransferItemsRepository);
  options.bind<RetailStockTransferItemsService>(RETAIL_STOCK_TRANSFER_ITEMS_TYPES.Service).to(RetailStockTransferItemsService);
  options.bind<RetailStockTransferItemsController>(RETAIL_STOCK_TRANSFER_ITEMS_TYPES.Controller).to(RetailStockTransferItemsController);
  options.bind<RetailStockTransferItemsRouter>(RETAIL_STOCK_TRANSFER_ITEMS_TYPES.Router).to(RetailStockTransferItemsRouter);
});
