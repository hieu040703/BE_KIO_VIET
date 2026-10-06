export const RETAIL_PAYROLL_ITEMS_TYPES = {
  Repository: Symbol.for("RetailPayrollItemsRepository"),
  Service: Symbol.for("RetailPayrollItemsService"),
  Controller: Symbol.for("RetailPayrollItemsController"),
  Router: Symbol.for("RetailPayrollItemsRouter"),
} as const;

export const PAYROLLITEMS_RESOURCE = "payroll-items" as const;
