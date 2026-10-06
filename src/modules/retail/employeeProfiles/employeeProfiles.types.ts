export const RETAIL_EMPLOYEE_PROFILES_TYPES = {
  Repository: Symbol.for("RetailEmployeeProfilesRepository"),
  Service: Symbol.for("RetailEmployeeProfilesService"),
  Controller: Symbol.for("RetailEmployeeProfilesController"),
  Router: Symbol.for("RetailEmployeeProfilesRouter"),
} as const;

export const EMPLOYEEPROFILES_RESOURCE = "employee-profiles" as const;
