export const RETAIL_UNITS_TYPES = {
  Repository: Symbol.for("RetailUnitsRepository"),
  Service: Symbol.for("RetailUnitsService"),
  Controller: Symbol.for("RetailUnitsController"),
  Router: Symbol.for("RetailUnitsRouter"),
} as const;

export const UNITS_RESOURCE = "units" as const;
