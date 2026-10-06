import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailWorkShiftsController } from "./workShifts.controller";
import { RetailWorkShiftsRepository } from "./workShifts.repository";
import { RetailWorkShiftsRouter } from "./workShifts.route";
import { RetailWorkShiftsService } from "./workShifts.service";
import { RETAIL_WORK_SHIFTS_TYPES } from "./workShifts.types";

export const workShiftsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailWorkShiftsRepository>(RETAIL_WORK_SHIFTS_TYPES.Repository).to(RetailWorkShiftsRepository);
  options.bind<RetailWorkShiftsService>(RETAIL_WORK_SHIFTS_TYPES.Service).to(RetailWorkShiftsService);
  options.bind<RetailWorkShiftsController>(RETAIL_WORK_SHIFTS_TYPES.Controller).to(RetailWorkShiftsController);
  options.bind<RetailWorkShiftsRouter>(RETAIL_WORK_SHIFTS_TYPES.Router).to(RetailWorkShiftsRouter);
});
