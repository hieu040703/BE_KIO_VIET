import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailEmployeeProfilesController } from "./employeeProfiles.controller";
import { RetailEmployeeProfilesRepository } from "./employeeProfiles.repository";
import { RetailEmployeeProfilesRouter } from "./employeeProfiles.route";
import { RetailEmployeeProfilesService } from "./employeeProfiles.service";
import { RETAIL_EMPLOYEE_PROFILES_TYPES } from "./employeeProfiles.types";

export const employeeProfilesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailEmployeeProfilesRepository>(RETAIL_EMPLOYEE_PROFILES_TYPES.Repository).to(RetailEmployeeProfilesRepository);
  options.bind<RetailEmployeeProfilesService>(RETAIL_EMPLOYEE_PROFILES_TYPES.Service).to(RetailEmployeeProfilesService);
  options.bind<RetailEmployeeProfilesController>(RETAIL_EMPLOYEE_PROFILES_TYPES.Controller).to(RetailEmployeeProfilesController);
  options.bind<RetailEmployeeProfilesRouter>(RETAIL_EMPLOYEE_PROFILES_TYPES.Router).to(RetailEmployeeProfilesRouter);
});
