import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailAuditLogs } from "@/database/models/retail/RetailGenericEntities";
import { RetailAuditLogsRepository } from "./auditLogs.repository";
import { RETAIL_AUDIT_LOGS_TYPES } from "./auditLogs.types";

@injectable()
export class RetailAuditLogsService extends BaseService<RetailAuditLogs> {
  constructor(@inject(RETAIL_AUDIT_LOGS_TYPES.Repository) repository: RetailAuditLogsRepository) {
    super(repository);
  }
}
