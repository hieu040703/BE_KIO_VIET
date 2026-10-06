export const RETAIL_DEPARTMENTS_TYPES = {
  Repository: Symbol.for("RetailDepartmentsRepository"),
  Service: Symbol.for("RetailDepartmentsService"),
  Controller: Symbol.for("RetailDepartmentsController"),
  Router: Symbol.for("RetailDepartmentsRouter"),
} as const;

export const DEPARTMENTS_RESOURCE = "departments" as const;
