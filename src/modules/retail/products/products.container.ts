import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailProductsController } from "./products.controller";
import { RetailProductsRepository } from "./products.repository";
import { RetailProductsRouter } from "./products.route";
import { RetailProductsService } from "./products.service";
import { RETAIL_PRODUCTS_TYPES } from "./products.types";

export const productsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailProductsRepository>(RETAIL_PRODUCTS_TYPES.Repository).to(RetailProductsRepository);
  options.bind<RetailProductsService>(RETAIL_PRODUCTS_TYPES.Service).to(RetailProductsService);
  options.bind<RetailProductsController>(RETAIL_PRODUCTS_TYPES.Controller).to(RetailProductsController);
  options.bind<RetailProductsRouter>(RETAIL_PRODUCTS_TYPES.Router).to(RetailProductsRouter);
});
