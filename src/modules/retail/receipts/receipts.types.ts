export const RETAIL_RECEIPTS_TYPES = {
  Repository: Symbol.for("RetailReceiptsRepository"),
  Service: Symbol.for("RetailReceiptsService"),
  Controller: Symbol.for("RetailReceiptsController"),
  Router: Symbol.for("RetailReceiptsRouter"),
} as const;

export const RECEIPTS_RESOURCE = "receipts" as const;
