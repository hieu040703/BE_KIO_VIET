export const RETAIL_EMPLOYEE_KPIS_TYPES = {
  Repository: Symbol.for("RetailEmployeeKpisRepository"),
  Service: Symbol.for("RetailEmployeeKpisService"),
  Controller: Symbol.for("RetailEmployeeKpisController"),
  Router: Symbol.for("RetailEmployeeKpisRouter"),
} as const;

export const EMPLOYEEKPIS_RESOURCE = "employee-kpis" as const;
