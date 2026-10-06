export const RETAIL_STORES_TYPES = {
  Repository: Symbol.for("RetailStoresRepository"),
  Service: Symbol.for("RetailStoresService"),
  Controller: Symbol.for("RetailStoresController"),
  Router: Symbol.for("RetailStoresRouter"),
} as const;

export const STORES_RESOURCE = "stores" as const;
