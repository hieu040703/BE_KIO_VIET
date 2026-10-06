import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailAttendanceDevicesController } from "./attendanceDevices.controller";
import { RetailAttendanceDevicesRepository } from "./attendanceDevices.repository";
import { RetailAttendanceDevicesRouter } from "./attendanceDevices.route";
import { RetailAttendanceDevicesService } from "./attendanceDevices.service";
import { RETAIL_ATTENDANCE_DEVICES_TYPES } from "./attendanceDevices.types";

export const attendanceDevicesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailAttendanceDevicesRepository>(RETAIL_ATTENDANCE_DEVICES_TYPES.Repository).to(RetailAttendanceDevicesRepository);
  options.bind<RetailAttendanceDevicesService>(RETAIL_ATTENDANCE_DEVICES_TYPES.Service).to(RetailAttendanceDevicesService);
  options.bind<RetailAttendanceDevicesController>(RETAIL_ATTENDANCE_DEVICES_TYPES.Controller).to(RetailAttendanceDevicesController);
  options.bind<RetailAttendanceDevicesRouter>(RETAIL_ATTENDANCE_DEVICES_TYPES.Router).to(RetailAttendanceDevicesRouter);
});
