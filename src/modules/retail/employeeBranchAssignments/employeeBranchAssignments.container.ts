import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailEmployeeBranchAssignmentsController } from "./employeeBranchAssignments.controller";
import { RetailEmployeeBranchAssignmentsRepository } from "./employeeBranchAssignments.repository";
import { RetailEmployeeBranchAssignmentsRouter } from "./employeeBranchAssignments.route";
import { RetailEmployeeBranchAssignmentsService } from "./employeeBranchAssignments.service";
import { RETAIL_EMPLOYEE_BRANCH_ASSIGNMENTS_TYPES } from "./employeeBranchAssignments.types";

export const employeeBranchAssignmentsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailEmployeeBranchAssignmentsRepository>(RETAIL_EMPLOYEE_BRANCH_ASSIGNMENTS_TYPES.Repository).to(RetailEmployeeBranchAssignmentsRepository);
  options.bind<RetailEmployeeBranchAssignmentsService>(RETAIL_EMPLOYEE_BRANCH_ASSIGNMENTS_TYPES.Service).to(RetailEmployeeBranchAssignmentsService);
  options.bind<RetailEmployeeBranchAssignmentsController>(RETAIL_EMPLOYEE_BRANCH_ASSIGNMENTS_TYPES.Controller).to(RetailEmployeeBranchAssignmentsController);
  options.bind<RetailEmployeeBranchAssignmentsRouter>(RETAIL_EMPLOYEE_BRANCH_ASSIGNMENTS_TYPES.Router).to(RetailEmployeeBranchAssignmentsRouter);
});
