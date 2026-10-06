export const RETAIL_PRODUCT_UNITS_TYPES = {
  Repository: Symbol.for("RetailProductUnitsRepository"),
  Service: Symbol.for("RetailProductUnitsService"),
  Controller: Symbol.for("RetailProductUnitsController"),
  Router: Symbol.for("RetailProductUnitsRouter"),
} as const;

export const PRODUCTUNITS_RESOURCE = "product-units" as const;
