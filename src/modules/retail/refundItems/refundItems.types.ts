export const RETAIL_REFUND_ITEMS_TYPES = {
  Repository: Symbol.for("RetailRefundItemsRepository"),
  Service: Symbol.for("RetailRefundItemsService"),
  Controller: Symbol.for("RetailRefundItemsController"),
  Router: Symbol.for("RetailRefundItemsRouter"),
} as const;

export const REFUNDITEMS_RESOURCE = "refund-items" as const;
