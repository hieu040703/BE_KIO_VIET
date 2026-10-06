export const RETAIL_LEAVE_TYPES_TYPES = {
  Repository: Symbol.for("RetailLeaveTypesRepository"),
  Service: Symbol.for("RetailLeaveTypesService"),
  Controller: Symbol.for("RetailLeaveTypesController"),
  Router: Symbol.for("RetailLeaveTypesRouter"),
} as const;

export const LEAVETYPES_RESOURCE = "leave-types" as const;
