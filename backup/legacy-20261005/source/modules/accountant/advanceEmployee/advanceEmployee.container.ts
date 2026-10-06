import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AdvanceEmployeeController } from "./advanceEmployee.controller";
import { AdvanceEmployeeService } from "./advanceEmployee.service";
import { AdvanceEmployeeRepository } from "./advanceEmployee.repository";
import { AdvanceEmployeeRouter } from "./advanceEmployee.route";
import { ADVANCE_EMPLOYEE_TYPES } from "./advanceEmployee.types";

const advanceEmployeeModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<AdvanceEmployeeService>(ADVANCE_EMPLOYEE_TYPES.AdvanceEmployeeService).to(AdvanceEmployeeService);
  options
    .bind<AdvanceEmployeeController>(ADVANCE_EMPLOYEE_TYPES.AdvanceEmployeeController)
    .to(AdvanceEmployeeController);
  options
    .bind<AdvanceEmployeeRepository>(ADVANCE_EMPLOYEE_TYPES.AdvanceEmployeeRepository)
    .to(AdvanceEmployeeRepository);
  options.bind<AdvanceEmployeeRouter>(ADVANCE_EMPLOYEE_TYPES.AdvanceEmployeeRouter).to(AdvanceEmployeeRouter);
});

export { advanceEmployeeModule };
