import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailEmployeeContractsController } from "./employeeContracts.controller";
import { RetailEmployeeContractsRepository } from "./employeeContracts.repository";
import { RetailEmployeeContractsRouter } from "./employeeContracts.route";
import { RetailEmployeeContractsService } from "./employeeContracts.service";
import { RETAIL_EMPLOYEE_CONTRACTS_TYPES } from "./employeeContracts.types";

export const employeeContractsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailEmployeeContractsRepository>(RETAIL_EMPLOYEE_CONTRACTS_TYPES.Repository).to(RetailEmployeeContractsRepository);
  options.bind<RetailEmployeeContractsService>(RETAIL_EMPLOYEE_CONTRACTS_TYPES.Service).to(RetailEmployeeContractsService);
  options.bind<RetailEmployeeContractsController>(RETAIL_EMPLOYEE_CONTRACTS_TYPES.Controller).to(RetailEmployeeContractsController);
  options.bind<RetailEmployeeContractsRouter>(RETAIL_EMPLOYEE_CONTRACTS_TYPES.Router).to(RetailEmployeeContractsRouter);
});
