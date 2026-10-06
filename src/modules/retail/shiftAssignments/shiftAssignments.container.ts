import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailShiftAssignmentsController } from "./shiftAssignments.controller";
import { RetailShiftAssignmentsRepository } from "./shiftAssignments.repository";
import { RetailShiftAssignmentsRouter } from "./shiftAssignments.route";
import { RetailShiftAssignmentsService } from "./shiftAssignments.service";
import { RETAIL_SHIFT_ASSIGNMENTS_TYPES } from "./shiftAssignments.types";

export const shiftAssignmentsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailShiftAssignmentsRepository>(RETAIL_SHIFT_ASSIGNMENTS_TYPES.Repository).to(RetailShiftAssignmentsRepository);
  options.bind<RetailShiftAssignmentsService>(RETAIL_SHIFT_ASSIGNMENTS_TYPES.Service).to(RetailShiftAssignmentsService);
  options.bind<RetailShiftAssignmentsController>(RETAIL_SHIFT_ASSIGNMENTS_TYPES.Controller).to(RetailShiftAssignmentsController);
  options.bind<RetailShiftAssignmentsRouter>(RETAIL_SHIFT_ASSIGNMENTS_TYPES.Router).to(RetailShiftAssignmentsRouter);
});
