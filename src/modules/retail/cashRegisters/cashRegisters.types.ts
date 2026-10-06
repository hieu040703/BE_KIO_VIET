export const RETAIL_CASH_REGISTERS_TYPES = {
  Repository: Symbol.for("RetailCashRegistersRepository"),
  Service: Symbol.for("RetailCashRegistersService"),
  Controller: Symbol.for("RetailCashRegistersController"),
  Router: Symbol.for("RetailCashRegistersRouter"),
} as const;

export const CASHREGISTERS_RESOURCE = "cash-registers" as const;
