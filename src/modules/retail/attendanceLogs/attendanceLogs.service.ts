import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailAttendanceLogs } from "@/database/models/retail/RetailGenericEntities";
import { RetailAttendanceLogsRepository } from "./attendanceLogs.repository";
import { RETAIL_ATTENDANCE_LOGS_TYPES } from "./attendanceLogs.types";

@injectable()
export class RetailAttendanceLogsService extends BaseService<RetailAttendanceLogs> {
  constructor(@inject(RETAIL_ATTENDANCE_LOGS_TYPES.Repository) repository: RetailAttendanceLogsRepository) {
    super(repository);
  }
}
