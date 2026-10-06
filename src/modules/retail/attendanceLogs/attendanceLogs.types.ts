export const RETAIL_ATTENDANCE_LOGS_TYPES = {
  Repository: Symbol.for("RetailAttendanceLogsRepository"),
  Service: Symbol.for("RetailAttendanceLogsService"),
  Controller: Symbol.for("RetailAttendanceLogsController"),
  Router: Symbol.for("RetailAttendanceLogsRouter"),
} as const;

export const ATTENDANCELOGS_RESOURCE = "attendance-logs" as const;
