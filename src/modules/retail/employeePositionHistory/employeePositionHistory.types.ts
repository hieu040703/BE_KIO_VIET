export const RETAIL_EMPLOYEE_POSITION_HISTORY_TYPES = {
  Repository: Symbol.for("RetailEmployeePositionHistoryRepository"),
  Service: Symbol.for("RetailEmployeePositionHistoryService"),
  Controller: Symbol.for("RetailEmployeePositionHistoryController"),
  Router: Symbol.for("RetailEmployeePositionHistoryRouter"),
} as const;

export const EMPLOYEEPOSITIONHISTORY_RESOURCE = "employee-position-history" as const;
