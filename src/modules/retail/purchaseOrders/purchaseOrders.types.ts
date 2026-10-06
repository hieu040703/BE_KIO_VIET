export const RETAIL_PURCHASE_ORDERS_TYPES = {
  Repository: Symbol.for("RetailPurchaseOrdersRepository"),
  Service: Symbol.for("RetailPurchaseOrdersService"),
  Controller: Symbol.for("RetailPurchaseOrdersController"),
  Router: Symbol.for("RetailPurchaseOrdersRouter"),
} as const;

export const PURCHASEORDERS_RESOURCE = "purchase-orders" as const;
