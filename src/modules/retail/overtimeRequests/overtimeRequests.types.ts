export const RETAIL_OVERTIME_REQUESTS_TYPES = {
  Repository: Symbol.for("RetailOvertimeRequestsRepository"),
  Service: Symbol.for("RetailOvertimeRequestsService"),
  Controller: Symbol.for("RetailOvertimeRequestsController"),
  Router: Symbol.for("RetailOvertimeRequestsRouter"),
} as const;

export const OVERTIMEREQUESTS_RESOURCE = "overtime-requests" as const;
