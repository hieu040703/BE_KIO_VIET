export const RETAIL_EMPLOYEE_CONTRACTS_TYPES = {
  Repository: Symbol.for("RetailEmployeeContractsRepository"),
  Service: Symbol.for("RetailEmployeeContractsService"),
  Controller: Symbol.for("RetailEmployeeContractsController"),
  Router: Symbol.for("RetailEmployeeContractsRouter"),
} as const;

export const EMPLOYEECONTRACTS_RESOURCE = "employee-contracts" as const;
