import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailStockTransfersController } from "./stockTransfers.controller";
import { RetailStockTransfersRepository } from "./stockTransfers.repository";
import { RetailStockTransfersRouter } from "./stockTransfers.route";
import { RetailStockTransfersService } from "./stockTransfers.service";
import { RETAIL_STOCK_TRANSFERS_TYPES } from "./stockTransfers.types";

export const stockTransfersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailStockTransfersRepository>(RETAIL_STOCK_TRANSFERS_TYPES.Repository).to(RetailStockTransfersRepository);
  options.bind<RetailStockTransfersService>(RETAIL_STOCK_TRANSFERS_TYPES.Service).to(RetailStockTransfersService);
  options.bind<RetailStockTransfersController>(RETAIL_STOCK_TRANSFERS_TYPES.Controller).to(RetailStockTransfersController);
  options.bind<RetailStockTransfersRouter>(RETAIL_STOCK_TRANSFERS_TYPES.Router).to(RetailStockTransfersRouter);
});
