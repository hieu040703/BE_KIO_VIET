import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailStockLedgersController } from "./stockLedgers.controller";
import { RetailStockLedgersRepository } from "./stockLedgers.repository";
import { RetailStockLedgersRouter } from "./stockLedgers.route";
import { RetailStockLedgersService } from "./stockLedgers.service";
import { RETAIL_STOCK_LEDGERS_TYPES } from "./stockLedgers.types";

export const stockLedgersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailStockLedgersRepository>(RETAIL_STOCK_LEDGERS_TYPES.Repository).to(RetailStockLedgersRepository);
  options.bind<RetailStockLedgersService>(RETAIL_STOCK_LEDGERS_TYPES.Service).to(RetailStockLedgersService);
  options.bind<RetailStockLedgersController>(RETAIL_STOCK_LEDGERS_TYPES.Controller).to(RetailStockLedgersController);
  options.bind<RetailStockLedgersRouter>(RETAIL_STOCK_LEDGERS_TYPES.Router).to(RetailStockLedgersRouter);
});
