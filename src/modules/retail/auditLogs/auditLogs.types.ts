export const RETAIL_AUDIT_LOGS_TYPES = {
  Repository: Symbol.for("RetailAuditLogsRepository"),
  Service: Symbol.for("RetailAuditLogsService"),
  Controller: Symbol.for("RetailAuditLogsController"),
  Router: Symbol.for("RetailAuditLogsRouter"),
} as const;

export const AUDITLOGS_RESOURCE = "audit-logs" as const;
