import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPayrollsController } from "./payrolls.controller";
import { RetailPayrollsRepository } from "./payrolls.repository";
import { RetailPayrollsRouter } from "./payrolls.route";
import { RetailPayrollsService } from "./payrolls.service";
import { RETAIL_PAYROLLS_TYPES } from "./payrolls.types";

export const payrollsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPayrollsRepository>(RETAIL_PAYROLLS_TYPES.Repository).to(RetailPayrollsRepository);
  options.bind<RetailPayrollsService>(RETAIL_PAYROLLS_TYPES.Service).to(RetailPayrollsService);
  options.bind<RetailPayrollsController>(RETAIL_PAYROLLS_TYPES.Controller).to(RetailPayrollsController);
  options.bind<RetailPayrollsRouter>(RETAIL_PAYROLLS_TYPES.Router).to(RetailPayrollsRouter);
});
