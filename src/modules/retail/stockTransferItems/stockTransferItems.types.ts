export const RETAIL_STOCK_TRANSFER_ITEMS_TYPES = {
  Repository: Symbol.for("RetailStockTransferItemsRepository"),
  Service: Symbol.for("RetailStockTransferItemsService"),
  Controller: Symbol.for("RetailStockTransferItemsController"),
  Router: Symbol.for("RetailStockTransferItemsRouter"),
} as const;

export const STOCKTRANSFERITEMS_RESOURCE = "stock-transfer-items" as const;
