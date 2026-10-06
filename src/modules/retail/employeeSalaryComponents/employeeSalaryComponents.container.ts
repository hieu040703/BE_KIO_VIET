import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailEmployeeSalaryComponentsController } from "./employeeSalaryComponents.controller";
import { RetailEmployeeSalaryComponentsRepository } from "./employeeSalaryComponents.repository";
import { RetailEmployeeSalaryComponentsRouter } from "./employeeSalaryComponents.route";
import { RetailEmployeeSalaryComponentsService } from "./employeeSalaryComponents.service";
import { RETAIL_EMPLOYEE_SALARY_COMPONENTS_TYPES } from "./employeeSalaryComponents.types";

export const employeeSalaryComponentsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailEmployeeSalaryComponentsRepository>(RETAIL_EMPLOYEE_SALARY_COMPONENTS_TYPES.Repository).to(RetailEmployeeSalaryComponentsRepository);
  options.bind<RetailEmployeeSalaryComponentsService>(RETAIL_EMPLOYEE_SALARY_COMPONENTS_TYPES.Service).to(RetailEmployeeSalaryComponentsService);
  options.bind<RetailEmployeeSalaryComponentsController>(RETAIL_EMPLOYEE_SALARY_COMPONENTS_TYPES.Controller).to(RetailEmployeeSalaryComponentsController);
  options.bind<RetailEmployeeSalaryComponentsRouter>(RETAIL_EMPLOYEE_SALARY_COMPONENTS_TYPES.Router).to(RetailEmployeeSalaryComponentsRouter);
});
