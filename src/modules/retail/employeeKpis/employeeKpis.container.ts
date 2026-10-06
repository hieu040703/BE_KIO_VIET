import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailEmployeeKpisController } from "./employeeKpis.controller";
import { RetailEmployeeKpisRepository } from "./employeeKpis.repository";
import { RetailEmployeeKpisRouter } from "./employeeKpis.route";
import { RetailEmployeeKpisService } from "./employeeKpis.service";
import { RETAIL_EMPLOYEE_KPIS_TYPES } from "./employeeKpis.types";

export const employeeKpisModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailEmployeeKpisRepository>(RETAIL_EMPLOYEE_KPIS_TYPES.Repository).to(RetailEmployeeKpisRepository);
  options.bind<RetailEmployeeKpisService>(RETAIL_EMPLOYEE_KPIS_TYPES.Service).to(RetailEmployeeKpisService);
  options.bind<RetailEmployeeKpisController>(RETAIL_EMPLOYEE_KPIS_TYPES.Controller).to(RetailEmployeeKpisController);
  options.bind<RetailEmployeeKpisRouter>(RETAIL_EMPLOYEE_KPIS_TYPES.Router).to(RetailEmployeeKpisRouter);
});
