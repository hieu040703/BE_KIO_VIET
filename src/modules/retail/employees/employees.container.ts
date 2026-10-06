import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailEmployeesController } from "./employees.controller";
import { RetailEmployeesRepository } from "./employees.repository";
import { RetailEmployeesRouter } from "./employees.route";
import { RetailEmployeesService } from "./employees.service";
import { RETAIL_EMPLOYEES_TYPES } from "./employees.types";

export const employeesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailEmployeesRepository>(RETAIL_EMPLOYEES_TYPES.Repository).to(RetailEmployeesRepository);
  options.bind<RetailEmployeesService>(RETAIL_EMPLOYEES_TYPES.Service).to(RetailEmployeesService);
  options.bind<RetailEmployeesController>(RETAIL_EMPLOYEES_TYPES.Controller).to(RetailEmployeesController);
  options.bind<RetailEmployeesRouter>(RETAIL_EMPLOYEES_TYPES.Router).to(RetailEmployeesRouter);
});
