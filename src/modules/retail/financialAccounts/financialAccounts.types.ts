export const RETAIL_FINANCIAL_ACCOUNTS_TYPES = {
  Repository: Symbol.for("RetailFinancialAccountsRepository"),
  Service: Symbol.for("RetailFinancialAccountsService"),
  Controller: Symbol.for("RetailFinancialAccountsController"),
  Router: Symbol.for("RetailFinancialAccountsRouter"),
} as const;

export const FINANCIALACCOUNTS_RESOURCE = "financial-accounts" as const;
