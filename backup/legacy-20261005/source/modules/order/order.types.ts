import { CalculateOrderData } from "./handles/calculate.order";

export const ORDER_TYPES = {
  OrderService: Symbol.for("orderService"),
  OrderController: Symbol.for("orderController"),
  OrderRepository: Symbol.for("orderRepository"),
  OrderRouter: Symbol.for("orderRouter"),
  ClientOrderService: Symbol.for("clientOrderService"),
  ClientOrderController: Symbol.for("clientOrderController"),
  ClientOrderRepository: Symbol.for("clientOrderRepository"),
  ClientOrderRouter: Symbol.for("clientOrderRouter"),
  CalculateOrderData: Symbol.for("calculateOrderData"),
};
