export const RETAIL_EMPLOYEE_COMMISSIONS_TYPES = {
  Repository: Symbol.for("RetailEmployeeCommissionsRepository"),
  Service: Symbol.for("RetailEmployeeCommissionsService"),
  Controller: Symbol.for("RetailEmployeeCommissionsController"),
  Router: Symbol.for("RetailEmployeeCommissionsRouter"),
} as const;

export const EMPLOYEECOMMISSIONS_RESOURCE = "employee-commissions" as const;
