export const RETAIL_PURCHASE_RETURNS_TYPES = {
  Repository: Symbol.for("RetailPurchaseReturnsRepository"),
  Service: Symbol.for("RetailPurchaseReturnsService"),
  Controller: Symbol.for("RetailPurchaseReturnsController"),
  Router: Symbol.for("RetailPurchaseReturnsRouter"),
} as const;

export const PURCHASERETURNS_RESOURCE = "purchase-returns" as const;
