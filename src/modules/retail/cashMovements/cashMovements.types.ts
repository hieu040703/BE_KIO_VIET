export const RETAIL_CASH_MOVEMENTS_TYPES = {
  Repository: Symbol.for("RetailCashMovementsRepository"),
  Service: Symbol.for("RetailCashMovementsService"),
  Controller: Symbol.for("RetailCashMovementsController"),
  Router: Symbol.for("RetailCashMovementsRouter"),
} as const;

export const CASHMOVEMENTS_RESOURCE = "cash-movements" as const;
