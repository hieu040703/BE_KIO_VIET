import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailStockCountsController } from "./stockCounts.controller";
import { RetailStockCountsRepository } from "./stockCounts.repository";
import { RetailStockCountsRouter } from "./stockCounts.route";
import { RetailStockCountsService } from "./stockCounts.service";
import { RETAIL_STOCK_COUNTS_TYPES } from "./stockCounts.types";

export const stockCountsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailStockCountsRepository>(RETAIL_STOCK_COUNTS_TYPES.Repository).to(RetailStockCountsRepository);
  options.bind<RetailStockCountsService>(RETAIL_STOCK_COUNTS_TYPES.Service).to(RetailStockCountsService);
  options.bind<RetailStockCountsController>(RETAIL_STOCK_COUNTS_TYPES.Controller).to(RetailStockCountsController);
  options.bind<RetailStockCountsRouter>(RETAIL_STOCK_COUNTS_TYPES.Router).to(RetailStockCountsRouter);
});
