export const RETAIL_SHIFT_ASSIGNMENTS_TYPES = {
  Repository: Symbol.for("RetailShiftAssignmentsRepository"),
  Service: Symbol.for("RetailShiftAssignmentsService"),
  Controller: Symbol.for("RetailShiftAssignmentsController"),
  Router: Symbol.for("RetailShiftAssignmentsRouter"),
} as const;

export const SHIFTASSIGNMENTS_RESOURCE = "shift-assignments" as const;
