export const RETAIL_STOCK_ADJUSTMENT_ITEMS_TYPES = {
  Repository: Symbol.for("RetailStockAdjustmentItemsRepository"),
  Service: Symbol.for("RetailStockAdjustmentItemsService"),
  Controller: Symbol.for("RetailStockAdjustmentItemsController"),
  Router: Symbol.for("RetailStockAdjustmentItemsRouter"),
} as const;

export const STOCKADJUSTMENTITEMS_RESOURCE = "stock-adjustment-items" as const;
