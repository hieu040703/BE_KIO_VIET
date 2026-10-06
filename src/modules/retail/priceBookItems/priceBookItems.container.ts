import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPriceBookItemsController } from "./priceBookItems.controller";
import { RetailPriceBookItemsRepository } from "./priceBookItems.repository";
import { RetailPriceBookItemsRouter } from "./priceBookItems.route";
import { RetailPriceBookItemsService } from "./priceBookItems.service";
import { RETAIL_PRICE_BOOK_ITEMS_TYPES } from "./priceBookItems.types";

export const priceBookItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPriceBookItemsRepository>(RETAIL_PRICE_BOOK_ITEMS_TYPES.Repository).to(RetailPriceBookItemsRepository);
  options.bind<RetailPriceBookItemsService>(RETAIL_PRICE_BOOK_ITEMS_TYPES.Service).to(RetailPriceBookItemsService);
  options.bind<RetailPriceBookItemsController>(RETAIL_PRICE_BOOK_ITEMS_TYPES.Controller).to(RetailPriceBookItemsController);
  options.bind<RetailPriceBookItemsRouter>(RETAIL_PRICE_BOOK_ITEMS_TYPES.Router).to(RetailPriceBookItemsRouter);
});
