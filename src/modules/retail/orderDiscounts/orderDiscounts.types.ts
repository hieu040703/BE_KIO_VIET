export const RETAIL_ORDER_DISCOUNTS_TYPES = {
  Repository: Symbol.for("RetailOrderDiscountsRepository"),
  Service: Symbol.for("RetailOrderDiscountsService"),
  Controller: Symbol.for("RetailOrderDiscountsController"),
  Router: Symbol.for("RetailOrderDiscountsRouter"),
} as const;

export const ORDERDISCOUNTS_RESOURCE = "order-discounts" as const;
