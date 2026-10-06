export const RETAIL_CUSTOMER_DEBT_TRANSACTIONS_TYPES = {
  Repository: Symbol.for("RetailCustomerDebtTransactionsRepository"),
  Service: Symbol.for("RetailCustomerDebtTransactionsService"),
  Controller: Symbol.for("RetailCustomerDebtTransactionsController"),
  Router: Symbol.for("RetailCustomerDebtTransactionsRouter"),
} as const;

export const CUSTOMERDEBTTRANSACTIONS_RESOURCE = "customer-debt-transactions" as const;
