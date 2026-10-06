export const RETAIL_SUPPLIER_DEBT_TRANSACTIONS_TYPES = {
  Repository: Symbol.for("RetailSupplierDebtTransactionsRepository"),
  Service: Symbol.for("RetailSupplierDebtTransactionsService"),
  Controller: Symbol.for("RetailSupplierDebtTransactionsController"),
  Router: Symbol.for("RetailSupplierDebtTransactionsRouter"),
} as const;

export const SUPPLIERDEBTTRANSACTIONS_RESOURCE = "supplier-debt-transactions" as const;
