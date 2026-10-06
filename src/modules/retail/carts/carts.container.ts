import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCartsController } from "./carts.controller";
import { RetailCartsRepository } from "./carts.repository";
import { RetailCartsRouter } from "./carts.route";
import { RetailCartsService } from "./carts.service";
import { RETAIL_CARTS_TYPES } from "./carts.types";

export const cartsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCartsRepository>(RETAIL_CARTS_TYPES.Repository).to(RetailCartsRepository);
  options.bind<RetailCartsService>(RETAIL_CARTS_TYPES.Service).to(RetailCartsService);
  options.bind<RetailCartsController>(RETAIL_CARTS_TYPES.Controller).to(RetailCartsController);
  options.bind<RetailCartsRouter>(RETAIL_CARTS_TYPES.Router).to(RetailCartsRouter);
});
