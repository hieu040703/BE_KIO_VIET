export const RETAIL_LOYALTY_TRANSACTIONS_TYPES = {
  Repository: Symbol.for("RetailLoyaltyTransactionsRepository"),
  Service: Symbol.for("RetailLoyaltyTransactionsService"),
  Controller: Symbol.for("RetailLoyaltyTransactionsController"),
  Router: Symbol.for("RetailLoyaltyTransactionsRouter"),
} as const;

export const LOYALTYTRANSACTIONS_RESOURCE = "loyalty-transactions" as const;
