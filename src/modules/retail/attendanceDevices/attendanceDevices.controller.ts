import { injectable, inject } from "inversify";
import { RetailAttendanceDevicesService } from "./attendanceDevices.service";
import { RETAIL_ATTENDANCE_DEVICES_TYPES } from "./attendanceDevices.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailAttendanceDevicesController extends BaseController<RetailAttendanceDevicesService> {
  constructor(@inject(RETAIL_ATTENDANCE_DEVICES_TYPES.Service) protected service: RetailAttendanceDevicesService) {
    super(service);
  }
}
