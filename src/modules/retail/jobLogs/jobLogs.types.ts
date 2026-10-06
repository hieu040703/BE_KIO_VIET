export const RETAIL_JOB_LOGS_TYPES = {
  Repository: Symbol.for("RetailJobLogsRepository"),
  Service: Symbol.for("RetailJobLogsService"),
  Controller: Symbol.for("RetailJobLogsController"),
  Router: Symbol.for("RetailJobLogsRouter"),
} as const;

export const JOBLOGS_RESOURCE = "job-logs" as const;
