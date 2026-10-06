export const RETAIL_WAREHOUSES_TYPES = {
  Repository: Symbol.for("RetailWarehousesRepository"),
  Service: Symbol.for("RetailWarehousesService"),
  Controller: Symbol.for("RetailWarehousesController"),
  Router: Symbol.for("RetailWarehousesRouter"),
} as const;

export const WAREHOUSES_RESOURCE = "warehouses" as const;
