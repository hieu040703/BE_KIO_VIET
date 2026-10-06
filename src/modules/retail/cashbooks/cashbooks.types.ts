export const RETAIL_CASHBOOKS_TYPES = {
  Repository: Symbol.for("RetailCashbooksRepository"),
  Service: Symbol.for("RetailCashbooksService"),
  Controller: Symbol.for("RetailCashbooksController"),
  Router: Symbol.for("RetailCashbooksRouter"),
} as const;

export const CASHBOOKS_RESOURCE = "cashbooks" as const;
