export const RETAIL_STOCK_COUNTS_TYPES = {
  Repository: Symbol.for("RetailStockCountsRepository"),
  Service: Symbol.for("RetailStockCountsService"),
  Controller: Symbol.for("RetailStockCountsController"),
  Router: Symbol.for("RetailStockCountsRouter"),
} as const;

export const STOCKCOUNTS_RESOURCE = "stock-counts" as const;
