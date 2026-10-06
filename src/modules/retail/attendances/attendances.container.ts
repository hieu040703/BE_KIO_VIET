import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailAttendancesController } from "./attendances.controller";
import { RetailAttendancesRepository } from "./attendances.repository";
import { RetailAttendancesRouter } from "./attendances.route";
import { RetailAttendancesService } from "./attendances.service";
import { RETAIL_ATTENDANCES_TYPES } from "./attendances.types";

export const attendancesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailAttendancesRepository>(RETAIL_ATTENDANCES_TYPES.Repository).to(RetailAttendancesRepository);
  options.bind<RetailAttendancesService>(RETAIL_ATTENDANCES_TYPES.Service).to(RetailAttendancesService);
  options.bind<RetailAttendancesController>(RETAIL_ATTENDANCES_TYPES.Controller).to(RetailAttendancesController);
  options.bind<RetailAttendancesRouter>(RETAIL_ATTENDANCES_TYPES.Router).to(RetailAttendancesRouter);
});
