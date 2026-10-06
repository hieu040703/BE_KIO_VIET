export const RETAIL_WORK_SHIFTS_TYPES = {
  Repository: Symbol.for("RetailWorkShiftsRepository"),
  Service: Symbol.for("RetailWorkShiftsService"),
  Controller: Symbol.for("RetailWorkShiftsController"),
  Router: Symbol.for("RetailWorkShiftsRouter"),
} as const;

export const WORKSHIFTS_RESOURCE = "work-shifts" as const;
