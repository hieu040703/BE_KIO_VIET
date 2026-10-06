import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailShippingOrdersController } from "./shippingOrders.controller";
import { RetailShippingOrdersRepository } from "./shippingOrders.repository";
import { RetailShippingOrdersRouter } from "./shippingOrders.route";
import { RetailShippingOrdersService } from "./shippingOrders.service";
import { RETAIL_SHIPPING_ORDERS_TYPES } from "./shippingOrders.types";

export const shippingOrdersModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailShippingOrdersRepository>(RETAIL_SHIPPING_ORDERS_TYPES.Repository).to(RetailShippingOrdersRepository);
  options.bind<RetailShippingOrdersService>(RETAIL_SHIPPING_ORDERS_TYPES.Service).to(RetailShippingOrdersService);
  options.bind<RetailShippingOrdersController>(RETAIL_SHIPPING_ORDERS_TYPES.Controller).to(RetailShippingOrdersController);
  options.bind<RetailShippingOrdersRouter>(RETAIL_SHIPPING_ORDERS_TYPES.Router).to(RetailShippingOrdersRouter);
});
