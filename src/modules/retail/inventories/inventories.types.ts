export const RETAIL_INVENTORIES_TYPES = {
  Repository: Symbol.for("RetailInventoriesRepository"),
  Service: Symbol.for("RetailInventoriesService"),
  Controller: Symbol.for("RetailInventoriesController"),
  Router: Symbol.for("RetailInventoriesRouter"),
} as const;

export const INVENTORIES_RESOURCE = "inventories" as const;
