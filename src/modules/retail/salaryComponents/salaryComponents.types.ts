export const RETAIL_SALARY_COMPONENTS_TYPES = {
  Repository: Symbol.for("RetailSalaryComponentsRepository"),
  Service: Symbol.for("RetailSalaryComponentsService"),
  Controller: Symbol.for("RetailSalaryComponentsController"),
  Router: Symbol.for("RetailSalaryComponentsRouter"),
} as const;

export const SALARYCOMPONENTS_RESOURCE = "salary-components" as const;
