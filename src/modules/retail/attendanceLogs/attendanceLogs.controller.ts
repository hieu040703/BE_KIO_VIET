import { injectable, inject } from "inversify";
import { RetailAttendanceLogsService } from "./attendanceLogs.service";
import { RETAIL_ATTENDANCE_LOGS_TYPES } from "./attendanceLogs.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailAttendanceLogsController extends BaseController<RetailAttendanceLogsService> {
  constructor(@inject(RETAIL_ATTENDANCE_LOGS_TYPES.Service) protected service: RetailAttendanceLogsService) {
    super(service);
  }
}
