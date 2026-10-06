export const RETAIL_ORDER_TAXES_TYPES = {
  Repository: Symbol.for("RetailOrderTaxesRepository"),
  Service: Symbol.for("RetailOrderTaxesService"),
  Controller: Symbol.for("RetailOrderTaxesController"),
  Router: Symbol.for("RetailOrderTaxesRouter"),
} as const;

export const ORDERTAXES_RESOURCE = "order-taxes" as const;
