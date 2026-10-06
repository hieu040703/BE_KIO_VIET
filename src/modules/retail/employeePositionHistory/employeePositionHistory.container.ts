import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailEmployeePositionHistoryController } from "./employeePositionHistory.controller";
import { RetailEmployeePositionHistoryRepository } from "./employeePositionHistory.repository";
import { RetailEmployeePositionHistoryRouter } from "./employeePositionHistory.route";
import { RetailEmployeePositionHistoryService } from "./employeePositionHistory.service";
import { RETAIL_EMPLOYEE_POSITION_HISTORY_TYPES } from "./employeePositionHistory.types";

export const employeePositionHistoryModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailEmployeePositionHistoryRepository>(RETAIL_EMPLOYEE_POSITION_HISTORY_TYPES.Repository).to(RetailEmployeePositionHistoryRepository);
  options.bind<RetailEmployeePositionHistoryService>(RETAIL_EMPLOYEE_POSITION_HISTORY_TYPES.Service).to(RetailEmployeePositionHistoryService);
  options.bind<RetailEmployeePositionHistoryController>(RETAIL_EMPLOYEE_POSITION_HISTORY_TYPES.Controller).to(RetailEmployeePositionHistoryController);
  options.bind<RetailEmployeePositionHistoryRouter>(RETAIL_EMPLOYEE_POSITION_HISTORY_TYPES.Router).to(RetailEmployeePositionHistoryRouter);
});
