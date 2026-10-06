export const RETAIL_PURCHASE_RETURN_ITEMS_TYPES = {
  Repository: Symbol.for("RetailPurchaseReturnItemsRepository"),
  Service: Symbol.for("RetailPurchaseReturnItemsService"),
  Controller: Symbol.for("RetailPurchaseReturnItemsController"),
  Router: Symbol.for("RetailPurchaseReturnItemsRouter"),
} as const;

export const PURCHASERETURNITEMS_RESOURCE = "purchase-return-items" as const;
