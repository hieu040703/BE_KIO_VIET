import { injectable } from "inversify";
import { RetailAttendanceDevices } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ATTENDANCEDEVICES_RESOURCE } from "./attendanceDevices.types";

@injectable()
export class RetailAttendanceDevicesRepository extends BaseRepository<RetailAttendanceDevices> {
  protected entityClass = RetailAttendanceDevices;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ATTENDANCEDEVICES_RESOURCE];
  }
}
