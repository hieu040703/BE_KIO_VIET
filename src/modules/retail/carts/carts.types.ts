export const RETAIL_CARTS_TYPES = {
  Repository: Symbol.for("RetailCartsRepository"),
  Service: Symbol.for("RetailCartsService"),
  Controller: Symbol.for("RetailCartsController"),
  Router: Symbol.for("RetailCartsRouter"),
} as const;

export const CARTS_RESOURCE = "carts" as const;
