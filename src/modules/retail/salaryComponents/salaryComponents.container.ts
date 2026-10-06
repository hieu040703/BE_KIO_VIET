import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailSalaryComponentsController } from "./salaryComponents.controller";
import { RetailSalaryComponentsRepository } from "./salaryComponents.repository";
import { RetailSalaryComponentsRouter } from "./salaryComponents.route";
import { RetailSalaryComponentsService } from "./salaryComponents.service";
import { RETAIL_SALARY_COMPONENTS_TYPES } from "./salaryComponents.types";

export const salaryComponentsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailSalaryComponentsRepository>(RETAIL_SALARY_COMPONENTS_TYPES.Repository).to(RetailSalaryComponentsRepository);
  options.bind<RetailSalaryComponentsService>(RETAIL_SALARY_COMPONENTS_TYPES.Service).to(RetailSalaryComponentsService);
  options.bind<RetailSalaryComponentsController>(RETAIL_SALARY_COMPONENTS_TYPES.Controller).to(RetailSalaryComponentsController);
  options.bind<RetailSalaryComponentsRouter>(RETAIL_SALARY_COMPONENTS_TYPES.Router).to(RetailSalaryComponentsRouter);
});
