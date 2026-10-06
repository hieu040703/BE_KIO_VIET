export const RETAIL_ORDERS_TYPES = {
  Repository: Symbol.for("RetailOrdersRepository"),
  Service: Symbol.for("RetailOrdersService"),
  Controller: Symbol.for("RetailOrdersController"),
  Router: Symbol.for("RetailOrdersRouter"),
} as const;

export const ORDERS_RESOURCE = "orders" as const;
