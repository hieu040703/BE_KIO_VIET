export const RETAIL_STOCK_COUNT_ITEMS_TYPES = {
  Repository: Symbol.for("RetailStockCountItemsRepository"),
  Service: Symbol.for("RetailStockCountItemsService"),
  Controller: Symbol.for("RetailStockCountItemsController"),
  Router: Symbol.for("RetailStockCountItemsRouter"),
} as const;

export const STOCKCOUNTITEMS_RESOURCE = "stock-count-items" as const;
