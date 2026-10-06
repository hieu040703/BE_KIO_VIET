import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPriceBooksController } from "./priceBooks.controller";
import { RetailPriceBooksRepository } from "./priceBooks.repository";
import { RetailPriceBooksRouter } from "./priceBooks.route";
import { RetailPriceBooksService } from "./priceBooks.service";
import { RETAIL_PRICE_BOOKS_TYPES } from "./priceBooks.types";

export const priceBooksModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPriceBooksRepository>(RETAIL_PRICE_BOOKS_TYPES.Repository).to(RetailPriceBooksRepository);
  options.bind<RetailPriceBooksService>(RETAIL_PRICE_BOOKS_TYPES.Service).to(RetailPriceBooksService);
  options.bind<RetailPriceBooksController>(RETAIL_PRICE_BOOKS_TYPES.Controller).to(RetailPriceBooksController);
  options.bind<RetailPriceBooksRouter>(RETAIL_PRICE_BOOKS_TYPES.Router).to(RetailPriceBooksRouter);
});
