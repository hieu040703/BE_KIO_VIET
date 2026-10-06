import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailAttendanceDevices } from "@/database/models/retail/RetailGenericEntities";
import { RetailAttendanceDevicesRepository } from "./attendanceDevices.repository";
import { RETAIL_ATTENDANCE_DEVICES_TYPES } from "./attendanceDevices.types";

@injectable()
export class RetailAttendanceDevicesService extends BaseService<RetailAttendanceDevices> {
  constructor(@inject(RETAIL_ATTENDANCE_DEVICES_TYPES.Repository) repository: RetailAttendanceDevicesRepository) {
    super(repository);
  }
}
