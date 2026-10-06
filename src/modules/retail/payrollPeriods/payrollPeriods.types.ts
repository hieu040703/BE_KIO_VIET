export const RETAIL_PAYROLL_PERIODS_TYPES = {
  Repository: Symbol.for("RetailPayrollPeriodsRepository"),
  Service: Symbol.for("RetailPayrollPeriodsService"),
  Controller: Symbol.for("RetailPayrollPeriodsController"),
  Router: Symbol.for("RetailPayrollPeriodsRouter"),
} as const;

export const PAYROLLPERIODS_RESOURCE = "payroll-periods" as const;
