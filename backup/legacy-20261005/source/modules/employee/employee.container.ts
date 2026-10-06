
import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { EmployeeController } from "./employee.controller";
import { EmployeeService } from "./employee.service";
import { EmployeeRepository } from "./employee.repository";
import { EmployeeRouter } from "./employee.route";
import { EMPLOYEE_TYPES } from "./employee.types";
import { CommonEmployeeRouter } from "./common.employee.route";

const employeeModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<EmployeeService>(EMPLOYEE_TYPES.EmployeeService).to(EmployeeService);
  options.bind<EmployeeController>(EMPLOYEE_TYPES.EmployeeController).to(EmployeeController);
  options.bind<EmployeeRepository>(EMPLOYEE_TYPES.EmployeeRepository).to(EmployeeRepository);
  options.bind<EmployeeRouter>(EMPLOYEE_TYPES.EmployeeRouter).to(EmployeeRouter);
  options.bind<CommonEmployeeRouter>(EMPLOYEE_TYPES.CommonEmployeeRouter).to(CommonEmployeeRouter);
});

export { employeeModule };