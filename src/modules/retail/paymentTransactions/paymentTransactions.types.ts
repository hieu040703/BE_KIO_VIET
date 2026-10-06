export const RETAIL_PAYMENT_TRANSACTIONS_TYPES = {
  Repository: Symbol.for("RetailPaymentTransactionsRepository"),
  Service: Symbol.for("RetailPaymentTransactionsService"),
  Controller: Symbol.for("RetailPaymentTransactionsController"),
  Router: Symbol.for("RetailPaymentTransactionsRouter"),
} as const;

export const PAYMENTTRANSACTIONS_RESOURCE = "payment-transactions" as const;
