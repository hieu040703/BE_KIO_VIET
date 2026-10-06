export const RETAIL_EXCHANGES_TYPES = {
  Repository: Symbol.for("RetailExchangesRepository"),
  Service: Symbol.for("RetailExchangesService"),
  Controller: Symbol.for("RetailExchangesController"),
  Router: Symbol.for("RetailExchangesRouter"),
} as const;

export const EXCHANGES_RESOURCE = "exchanges" as const;
