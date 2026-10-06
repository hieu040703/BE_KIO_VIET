import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { OrderEmployeeController } from "./orderEmployee.controller";
import { OrderEmployeeService } from "./orderEmployee.service";
import { OrderEmployeeRepository } from "./orderEmployee.repository";
import { OrderEmployeeRouter } from "./orderEmployee.route";
import { ORDER_EMPLOYEE_TYPES } from "./orderEmployee.types";

const orderEmployeeModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<OrderEmployeeService>(ORDER_EMPLOYEE_TYPES.OrderEmployeeService).to(OrderEmployeeService);
  options.bind<OrderEmployeeController>(ORDER_EMPLOYEE_TYPES.OrderEmployeeController).to(OrderEmployeeController);
  options.bind<OrderEmployeeRepository>(ORDER_EMPLOYEE_TYPES.OrderEmployeeRepository).to(OrderEmployeeRepository);
  options.bind<OrderEmployeeRouter>(ORDER_EMPLOYEE_TYPES.OrderEmployeeRouter).to(OrderEmployeeRouter);
});

export { orderEmployeeModule };
