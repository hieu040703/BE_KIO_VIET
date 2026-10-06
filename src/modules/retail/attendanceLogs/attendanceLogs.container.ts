import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailAttendanceLogsController } from "./attendanceLogs.controller";
import { RetailAttendanceLogsRepository } from "./attendanceLogs.repository";
import { RetailAttendanceLogsRouter } from "./attendanceLogs.route";
import { RetailAttendanceLogsService } from "./attendanceLogs.service";
import { RETAIL_ATTENDANCE_LOGS_TYPES } from "./attendanceLogs.types";

export const attendanceLogsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailAttendanceLogsRepository>(RETAIL_ATTENDANCE_LOGS_TYPES.Repository).to(RetailAttendanceLogsRepository);
  options.bind<RetailAttendanceLogsService>(RETAIL_ATTENDANCE_LOGS_TYPES.Service).to(RetailAttendanceLogsService);
  options.bind<RetailAttendanceLogsController>(RETAIL_ATTENDANCE_LOGS_TYPES.Controller).to(RetailAttendanceLogsController);
  options.bind<RetailAttendanceLogsRouter>(RETAIL_ATTENDANCE_LOGS_TYPES.Router).to(RetailAttendanceLogsRouter);
});
