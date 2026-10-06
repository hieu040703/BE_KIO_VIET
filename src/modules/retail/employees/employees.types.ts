export const RETAIL_EMPLOYEES_TYPES = {
  Repository: Symbol.for("RetailEmployeesRepository"),
  Service: Symbol.for("RetailEmployeesService"),
  Controller: Symbol.for("RetailEmployeesController"),
  Router: Symbol.for("RetailEmployeesRouter"),
} as const;

export const EMPLOYEES_RESOURCE = "employees" as const;
