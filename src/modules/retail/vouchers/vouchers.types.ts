export const RETAIL_VOUCHERS_TYPES = {
  Repository: Symbol.for("RetailVouchersRepository"),
  Service: Symbol.for("RetailVouchersService"),
  Controller: Symbol.for("RetailVouchersController"),
  Router: Symbol.for("RetailVouchersRouter"),
} as const;

export const VOUCHERS_RESOURCE = "vouchers" as const;
