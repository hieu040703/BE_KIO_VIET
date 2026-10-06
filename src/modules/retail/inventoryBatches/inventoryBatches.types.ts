export const RETAIL_INVENTORY_BATCHES_TYPES = {
  Repository: Symbol.for("RetailInventoryBatchesRepository"),
  Service: Symbol.for("RetailInventoryBatchesService"),
  Controller: Symbol.for("RetailInventoryBatchesController"),
  Router: Symbol.for("RetailInventoryBatchesRouter"),
} as const;

export const INVENTORYBATCHES_RESOURCE = "inventory-batches" as const;
