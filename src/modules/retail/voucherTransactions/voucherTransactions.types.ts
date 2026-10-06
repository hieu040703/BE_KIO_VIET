export const RETAIL_VOUCHER_TRANSACTIONS_TYPES = {
  Repository: Symbol.for("RetailVoucherTransactionsRepository"),
  Service: Symbol.for("RetailVoucherTransactionsService"),
  Controller: Symbol.for("RetailVoucherTransactionsController"),
  Router: Symbol.for("RetailVoucherTransactionsRouter"),
} as const;

export const VOUCHERTRANSACTIONS_RESOURCE = "voucher-transactions" as const;
