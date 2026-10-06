export const RETAIL_PRODUCTS_TYPES = {
  Repository: Symbol.for("RetailProductsRepository"),
  Service: Symbol.for("RetailProductsService"),
  Controller: Symbol.for("RetailProductsController"),
  Router: Symbol.for("RetailProductsRouter"),
} as const;

export const PRODUCTS_RESOURCE = "products" as const;
