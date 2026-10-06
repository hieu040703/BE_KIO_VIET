import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailOrderItemsController } from "./orderItems.controller";
import { RetailOrderItemsRepository } from "./orderItems.repository";
import { RetailOrderItemsRouter } from "./orderItems.route";
import { RetailOrderItemsService } from "./orderItems.service";
import { RETAIL_ORDER_ITEMS_TYPES } from "./orderItems.types";

export const orderItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailOrderItemsRepository>(RETAIL_ORDER_ITEMS_TYPES.Repository).to(RetailOrderItemsRepository);
  options.bind<RetailOrderItemsService>(RETAIL_ORDER_ITEMS_TYPES.Service).to(RetailOrderItemsService);
  options.bind<RetailOrderItemsController>(RETAIL_ORDER_ITEMS_TYPES.Controller).to(RetailOrderItemsController);
  options.bind<RetailOrderItemsRouter>(RETAIL_ORDER_ITEMS_TYPES.Router).to(RetailOrderItemsRouter);
});
