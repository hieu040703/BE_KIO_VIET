export const RETAIL_STOCK_ADJUSTMENTS_TYPES = {
  Repository: Symbol.for("RetailStockAdjustmentsRepository"),
  Service: Symbol.for("RetailStockAdjustmentsService"),
  Controller: Symbol.for("RetailStockAdjustmentsController"),
  Router: Symbol.for("RetailStockAdjustmentsRouter"),
} as const;

export const STOCKADJUSTMENTS_RESOURCE = "stock-adjustments" as const;
