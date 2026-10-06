export const RETAIL_CUSTOMER_DEBTS_TYPES = {
  Repository: Symbol.for("RetailCustomerDebtsRepository"),
  Service: Symbol.for("RetailCustomerDebtsService"),
  Controller: Symbol.for("RetailCustomerDebtsController"),
  Router: Symbol.for("RetailCustomerDebtsRouter"),
} as const;

export const CUSTOMERDEBTS_RESOURCE = "customer-debts" as const;
