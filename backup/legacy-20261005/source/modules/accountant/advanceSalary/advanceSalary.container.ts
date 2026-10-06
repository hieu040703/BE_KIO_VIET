import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AdvanceSalaryController } from "./advanceSalary.controller";
import { AdvanceSalaryService } from "./advanceSalary.service";
import { AdvanceSalaryRepository } from "./advanceSalary.repository";
import { AdvanceSalaryRouter } from "./advanceSalary.route";
import { ADVANCE_SALARY_TYPES } from "./advanceSalary.types";

const advanceSalaryModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<AdvanceSalaryService>(ADVANCE_SALARY_TYPES.AdvanceSalaryService).to(AdvanceSalaryService);
  options.bind<AdvanceSalaryController>(ADVANCE_SALARY_TYPES.AdvanceSalaryController).to(AdvanceSalaryController);
  options.bind<AdvanceSalaryRepository>(ADVANCE_SALARY_TYPES.AdvanceSalaryRepository).to(AdvanceSalaryRepository);
  options.bind<AdvanceSalaryRouter>(ADVANCE_SALARY_TYPES.AdvanceSalaryRouter).to(AdvanceSalaryRouter);
});

export { advanceSalaryModule };
