export const RETAIL_ACCOUNT_TRANSACTIONS_TYPES = {
  Repository: Symbol.for("RetailAccountTransactionsRepository"),
  Service: Symbol.for("RetailAccountTransactionsService"),
  Controller: Symbol.for("RetailAccountTransactionsController"),
  Router: Symbol.for("RetailAccountTransactionsRouter"),
} as const;

export const ACCOUNTTRANSACTIONS_RESOURCE = "account-transactions" as const;
