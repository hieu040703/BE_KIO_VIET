import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailStockCountItemsController } from "./stockCountItems.controller";
import { RetailStockCountItemsRepository } from "./stockCountItems.repository";
import { RetailStockCountItemsRouter } from "./stockCountItems.route";
import { RetailStockCountItemsService } from "./stockCountItems.service";
import { RETAIL_STOCK_COUNT_ITEMS_TYPES } from "./stockCountItems.types";

export const stockCountItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailStockCountItemsRepository>(RETAIL_STOCK_COUNT_ITEMS_TYPES.Repository).to(RetailStockCountItemsRepository);
  options.bind<RetailStockCountItemsService>(RETAIL_STOCK_COUNT_ITEMS_TYPES.Service).to(RetailStockCountItemsService);
  options.bind<RetailStockCountItemsController>(RETAIL_STOCK_COUNT_ITEMS_TYPES.Controller).to(RetailStockCountItemsController);
  options.bind<RetailStockCountItemsRouter>(RETAIL_STOCK_COUNT_ITEMS_TYPES.Router).to(RetailStockCountItemsRouter);
});
