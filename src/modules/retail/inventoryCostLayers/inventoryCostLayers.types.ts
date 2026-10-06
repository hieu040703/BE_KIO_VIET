export const RETAIL_INVENTORY_COST_LAYERS_TYPES = {
  Repository: Symbol.for("RetailInventoryCostLayersRepository"),
  Service: Symbol.for("RetailInventoryCostLayersService"),
  Controller: Symbol.for("RetailInventoryCostLayersController"),
  Router: Symbol.for("RetailInventoryCostLayersRouter"),
} as const;

export const INVENTORYCOSTLAYERS_RESOURCE = "inventory-cost-layers" as const;
