export const RETAIL_LEAVE_REQUESTS_TYPES = {
  Repository: Symbol.for("RetailLeaveRequestsRepository"),
  Service: Symbol.for("RetailLeaveRequestsService"),
  Controller: Symbol.for("RetailLeaveRequestsController"),
  Router: Symbol.for("RetailLeaveRequestsRouter"),
} as const;

export const LEAVEREQUESTS_RESOURCE = "leave-requests" as const;
