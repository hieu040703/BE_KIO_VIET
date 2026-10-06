import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailEmployeeCommissionsController } from "./employeeCommissions.controller";
import { RetailEmployeeCommissionsRepository } from "./employeeCommissions.repository";
import { RetailEmployeeCommissionsRouter } from "./employeeCommissions.route";
import { RetailEmployeeCommissionsService } from "./employeeCommissions.service";
import { RETAIL_EMPLOYEE_COMMISSIONS_TYPES } from "./employeeCommissions.types";

export const employeeCommissionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailEmployeeCommissionsRepository>(RETAIL_EMPLOYEE_COMMISSIONS_TYPES.Repository).to(RetailEmployeeCommissionsRepository);
  options.bind<RetailEmployeeCommissionsService>(RETAIL_EMPLOYEE_COMMISSIONS_TYPES.Service).to(RetailEmployeeCommissionsService);
  options.bind<RetailEmployeeCommissionsController>(RETAIL_EMPLOYEE_COMMISSIONS_TYPES.Controller).to(RetailEmployeeCommissionsController);
  options.bind<RetailEmployeeCommissionsRouter>(RETAIL_EMPLOYEE_COMMISSIONS_TYPES.Router).to(RetailEmployeeCommissionsRouter);
});
