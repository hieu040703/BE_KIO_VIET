import { injectable, inject } from "inversify";
import { RetailAuditLogsService } from "./auditLogs.service";
import { RETAIL_AUDIT_LOGS_TYPES } from "./auditLogs.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailAuditLogsController extends BaseController<RetailAuditLogsService> {
  constructor(@inject(RETAIL_AUDIT_LOGS_TYPES.Service) protected service: RetailAuditLogsService) {
    super(service);
  }
}
