export const RETAIL_ATTENDANCES_TYPES = {
  Repository: Symbol.for("RetailAttendancesRepository"),
  Service: Symbol.for("RetailAttendancesService"),
  Controller: Symbol.for("RetailAttendancesController"),
  Router: Symbol.for("RetailAttendancesRouter"),
} as const;

export const ATTENDANCES_RESOURCE = "attendances" as const;
