export const RETAIL_EXPENSES_TYPES = {
  Repository: Symbol.for("RetailExpensesRepository"),
  Service: Symbol.for("RetailExpensesService"),
  Controller: Symbol.for("RetailExpensesController"),
  Router: Symbol.for("RetailExpensesRouter"),
} as const;

export const EXPENSES_RESOURCE = "expenses" as const;
