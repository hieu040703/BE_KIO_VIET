export const RETAIL_CASH_SESSIONS_TYPES = {
  Repository: Symbol.for("RetailCashSessionsRepository"),
  Service: Symbol.for("RetailCashSessionsService"),
  Controller: Symbol.for("RetailCashSessionsController"),
  Router: Symbol.for("RetailCashSessionsRouter"),
} as const;

export const CASHSESSIONS_RESOURCE = "cash-sessions" as const;
