export const RETAIL_PURCHASE_ORDER_ITEMS_TYPES = {
  Repository: Symbol.for("RetailPurchaseOrderItemsRepository"),
  Service: Symbol.for("RetailPurchaseOrderItemsService"),
  Controller: Symbol.for("RetailPurchaseOrderItemsController"),
  Router: Symbol.for("RetailPurchaseOrderItemsRouter"),
} as const;

export const PURCHASEORDERITEMS_RESOURCE = "purchase-order-items" as const;
