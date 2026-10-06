export const RETAIL_SHIPPING_ORDERS_TYPES = {
  Repository: Symbol.for("RetailShippingOrdersRepository"),
  Service: Symbol.for("RetailShippingOrdersService"),
  Controller: Symbol.for("RetailShippingOrdersController"),
  Router: Symbol.for("RetailShippingOrdersRouter"),
} as const;

export const SHIPPINGORDERS_RESOURCE = "shipping-orders" as const;
