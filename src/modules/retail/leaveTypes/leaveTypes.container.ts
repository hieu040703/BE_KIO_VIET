import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailLeaveTypesController } from "./leaveTypes.controller";
import { RetailLeaveTypesRepository } from "./leaveTypes.repository";
import { RetailLeaveTypesRouter } from "./leaveTypes.route";
import { RetailLeaveTypesService } from "./leaveTypes.service";
import { RETAIL_LEAVE_TYPES_TYPES } from "./leaveTypes.types";

export const leaveTypesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailLeaveTypesRepository>(RETAIL_LEAVE_TYPES_TYPES.Repository).to(RetailLeaveTypesRepository);
  options.bind<RetailLeaveTypesService>(RETAIL_LEAVE_TYPES_TYPES.Service).to(RetailLeaveTypesService);
  options.bind<RetailLeaveTypesController>(RETAIL_LEAVE_TYPES_TYPES.Controller).to(RetailLeaveTypesController);
  options.bind<RetailLeaveTypesRouter>(RETAIL_LEAVE_TYPES_TYPES.Router).to(RetailLeaveTypesRouter);
});
