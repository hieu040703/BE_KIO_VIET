export const RETAIL_STOCK_LEDGERS_TYPES = {
  Repository: Symbol.for("RetailStockLedgersRepository"),
  Service: Symbol.for("RetailStockLedgersService"),
  Controller: Symbol.for("RetailStockLedgersController"),
  Router: Symbol.for("RetailStockLedgersRouter"),
} as const;

export const STOCKLEDGERS_RESOURCE = "stock-ledgers" as const;
