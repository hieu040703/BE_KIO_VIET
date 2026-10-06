export const RETAIL_LEAVE_BALANCES_TYPES = {
  Repository: Symbol.for("RetailLeaveBalancesRepository"),
  Service: Symbol.for("RetailLeaveBalancesService"),
  Controller: Symbol.for("RetailLeaveBalancesController"),
  Router: Symbol.for("RetailLeaveBalancesRouter"),
} as const;

export const LEAVEBALANCES_RESOURCE = "leave-balances" as const;
