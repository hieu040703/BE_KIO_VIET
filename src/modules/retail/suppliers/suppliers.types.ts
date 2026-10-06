export const RETAIL_SUPPLIERS_TYPES = {
  Repository: Symbol.for("RetailSuppliersRepository"),
  Service: Symbol.for("RetailSuppliersService"),
  Controller: Symbol.for("RetailSuppliersController"),
  Router: Symbol.for("RetailSuppliersRouter"),
} as const;

export const SUPPLIERS_RESOURCE = "suppliers" as const;
