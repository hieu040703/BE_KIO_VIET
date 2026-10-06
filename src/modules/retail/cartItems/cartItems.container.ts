import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCartItemsController } from "./cartItems.controller";
import { RetailCartItemsRepository } from "./cartItems.repository";
import { RetailCartItemsRouter } from "./cartItems.route";
import { RetailCartItemsService } from "./cartItems.service";
import { RETAIL_CART_ITEMS_TYPES } from "./cartItems.types";

export const cartItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCartItemsRepository>(RETAIL_CART_ITEMS_TYPES.Repository).to(RetailCartItemsRepository);
  options.bind<RetailCartItemsService>(RETAIL_CART_ITEMS_TYPES.Service).to(RetailCartItemsService);
  options.bind<RetailCartItemsController>(RETAIL_CART_ITEMS_TYPES.Controller).to(RetailCartItemsController);
  options.bind<RetailCartItemsRouter>(RETAIL_CART_ITEMS_TYPES.Router).to(RetailCartItemsRouter);
});
