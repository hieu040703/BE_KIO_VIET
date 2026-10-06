export const RETAIL_RETURN_ITEMS_TYPES = {
  Repository: Symbol.for("RetailReturnItemsRepository"),
  Service: Symbol.for("RetailReturnItemsService"),
  Controller: Symbol.for("RetailReturnItemsController"),
  Router: Symbol.for("RetailReturnItemsRouter"),
} as const;

export const RETURNITEMS_RESOURCE = "return-items" as const;
