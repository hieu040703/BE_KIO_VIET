export const RETAIL_CUSTOMERS_TYPES = {
  Repository: Symbol.for("RetailCustomersRepository"),
  Service: Symbol.for("RetailCustomersService"),
  Controller: Symbol.for("RetailCustomersController"),
  Router: Symbol.for("RetailCustomersRouter"),
} as const;

export const CUSTOMERS_RESOURCE = "customers" as const;
