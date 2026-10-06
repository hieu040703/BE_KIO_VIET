import { injectable } from "inversify";
import { RetailAuditLogs } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { AUDITLOGS_RESOURCE } from "./auditLogs.types";

@injectable()
export class RetailAuditLogsRepository extends BaseRepository<RetailAuditLogs> {
  protected entityClass = RetailAuditLogs;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[AUDITLOGS_RESOURCE];
  }
}
