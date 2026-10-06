export const RETAIL_ORDER_ITEMS_TYPES = {
  Repository: Symbol.for("RetailOrderItemsRepository"),
  Service: Symbol.for("RetailOrderItemsService"),
  Controller: Symbol.for("RetailOrderItemsController"),
  Router: Symbol.for("RetailOrderItemsRouter"),
} as const;

export const ORDERITEMS_RESOURCE = "order-items" as const;
