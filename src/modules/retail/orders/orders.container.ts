import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailOrdersController } from "./orders.controller";
import { RetailOrdersRepository } from "./orders.repository";
import { RetailOrdersRouter } from "./orders.route";
import { RetailOrdersService } from "./orders.service";
import { RETAIL_ORDERS_TYPES } from "./orders.types";

export const ordersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailOrdersRepository>(RETAIL_ORDERS_TYPES.Repository).to(RetailOrdersRepository);
  options.bind<RetailOrdersService>(RETAIL_ORDERS_TYPES.Service).to(RetailOrdersService);
  options.bind<RetailOrdersController>(RETAIL_ORDERS_TYPES.Controller).to(RetailOrdersController);
  options.bind<RetailOrdersRouter>(RETAIL_ORDERS_TYPES.Router).to(RetailOrdersRouter);
});
