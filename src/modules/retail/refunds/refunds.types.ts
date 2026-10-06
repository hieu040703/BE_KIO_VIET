export const RETAIL_REFUNDS_TYPES = {
  Repository: Symbol.for("RetailRefundsRepository"),
  Service: Symbol.for("RetailRefundsService"),
  Controller: Symbol.for("RetailRefundsController"),
  Router: Symbol.for("RetailRefundsRouter"),
} as const;

export const REFUNDS_RESOURCE = "refunds" as const;
