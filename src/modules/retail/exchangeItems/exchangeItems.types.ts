export const RETAIL_EXCHANGE_ITEMS_TYPES = {
  Repository: Symbol.for("RetailExchangeItemsRepository"),
  Service: Symbol.for("RetailExchangeItemsService"),
  Controller: Symbol.for("RetailExchangeItemsController"),
  Router: Symbol.for("RetailExchangeItemsRouter"),
} as const;

export const EXCHANGEITEMS_RESOURCE = "exchange-items" as const;
