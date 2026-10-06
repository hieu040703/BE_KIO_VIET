import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { OrderRepository } from "./order.repository";
import { OrderRouter } from "./order.route";
import { ORDER_TYPES } from "./order.types";
import { ClientOrderRouter } from "./client.order.route";
import { CalculateOrderData } from "./handles/calculate.order";
import { ClientOrderController } from "./client.order.controller";
import { ClientOrderService } from "./client.order.service";
import { ClientOrderRepository } from "./client.order.repository";

const orderModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<OrderService>(ORDER_TYPES.OrderService).to(OrderService);
  options.bind<OrderController>(ORDER_TYPES.OrderController).to(OrderController);
  options.bind<OrderRepository>(ORDER_TYPES.OrderRepository).to(OrderRepository);
  options.bind<OrderRouter>(ORDER_TYPES.OrderRouter).to(OrderRouter);
  options.bind<ClientOrderRouter>(ORDER_TYPES.ClientOrderRouter).to(ClientOrderRouter);
  options.bind<ClientOrderController>(ORDER_TYPES.ClientOrderController).to(ClientOrderController);
  options.bind<ClientOrderService>(ORDER_TYPES.ClientOrderService).to(ClientOrderService);
  options.bind<ClientOrderRepository>(ORDER_TYPES.ClientOrderRepository).to(ClientOrderRepository);
  options.bind<CalculateOrderData>(ORDER_TYPES.CalculateOrderData).to(CalculateOrderData);
});

export { orderModule };
