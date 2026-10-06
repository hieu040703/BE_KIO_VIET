export const RETAIL_PAYROLLS_TYPES = {
  Repository: Symbol.for("RetailPayrollsRepository"),
  Service: Symbol.for("RetailPayrollsService"),
  Controller: Symbol.for("RetailPayrollsController"),
  Router: Symbol.for("RetailPayrollsRouter"),
} as const;

export const PAYROLLS_RESOURCE = "payrolls" as const;
