import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailAuditLogsController } from "./auditLogs.controller";
import { RetailAuditLogsRepository } from "./auditLogs.repository";
import { RetailAuditLogsRouter } from "./auditLogs.route";
import { RetailAuditLogsService } from "./auditLogs.service";
import { RETAIL_AUDIT_LOGS_TYPES } from "./auditLogs.types";

export const auditLogsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailAuditLogsRepository>(RETAIL_AUDIT_LOGS_TYPES.Repository).to(RetailAuditLogsRepository);
  options.bind<RetailAuditLogsService>(RETAIL_AUDIT_LOGS_TYPES.Service).to(RetailAuditLogsService);
  options.bind<RetailAuditLogsController>(RETAIL_AUDIT_LOGS_TYPES.Controller).to(RetailAuditLogsController);
  options.bind<RetailAuditLogsRouter>(RETAIL_AUDIT_LOGS_TYPES.Router).to(RetailAuditLogsRouter);
});
