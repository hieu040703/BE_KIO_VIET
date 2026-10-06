import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailExchangeItemsController } from "./exchangeItems.controller";
import { RetailExchangeItemsRepository } from "./exchangeItems.repository";
import { RetailExchangeItemsRouter } from "./exchangeItems.route";
import { RetailExchangeItemsService } from "./exchangeItems.service";
import { RETAIL_EXCHANGE_ITEMS_TYPES } from "./exchangeItems.types";

export const exchangeItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailExchangeItemsRepository>(RETAIL_EXCHANGE_ITEMS_TYPES.Repository).to(RetailExchangeItemsRepository);
  options.bind<RetailExchangeItemsService>(RETAIL_EXCHANGE_ITEMS_TYPES.Service).to(RetailExchangeItemsService);
  options.bind<RetailExchangeItemsController>(RETAIL_EXCHANGE_ITEMS_TYPES.Controller).to(RetailExchangeItemsController);
  options.bind<RetailExchangeItemsRouter>(RETAIL_EXCHANGE_ITEMS_TYPES.Router).to(RetailExchangeItemsRouter);
});
