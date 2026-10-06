export const RETAIL_STOCK_TRANSFERS_TYPES = {
  Repository: Symbol.for("RetailStockTransfersRepository"),
  Service: Symbol.for("RetailStockTransfersService"),
  Controller: Symbol.for("RetailStockTransfersController"),
  Router: Symbol.for("RetailStockTransfersRouter"),
} as const;

export const STOCKTRANSFERS_RESOURCE = "stock-transfers" as const;
