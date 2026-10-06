export const RETAIL_EMPLOYEE_SALARY_COMPONENTS_TYPES = {
  Repository: Symbol.for("RetailEmployeeSalaryComponentsRepository"),
  Service: Symbol.for("RetailEmployeeSalaryComponentsService"),
  Controller: Symbol.for("RetailEmployeeSalaryComponentsController"),
  Router: Symbol.for("RetailEmployeeSalaryComponentsRouter"),
} as const;

export const EMPLOYEESALARYCOMPONENTS_RESOURCE = "employee-salary-components" as const;
