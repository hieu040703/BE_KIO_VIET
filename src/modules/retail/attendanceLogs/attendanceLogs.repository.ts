import { injectable } from "inversify";
import { RetailAttendanceLogs } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ATTENDANCELOGS_RESOURCE } from "./attendanceLogs.types";

@injectable()
export class RetailAttendanceLogsRepository extends BaseRepository<RetailAttendanceLogs> {
  protected entityClass = RetailAttendanceLogs;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ATTENDANCELOGS_RESOURCE];
  }
}
