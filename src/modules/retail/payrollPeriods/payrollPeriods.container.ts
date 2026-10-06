import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPayrollPeriodsController } from "./payrollPeriods.controller";
import { RetailPayrollPeriodsRepository } from "./payrollPeriods.repository";
import { RetailPayrollPeriodsRouter } from "./payrollPeriods.route";
import { RetailPayrollPeriodsService } from "./payrollPeriods.service";
import { RETAIL_PAYROLL_PERIODS_TYPES } from "./payrollPeriods.types";

export const payrollPeriodsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPayrollPeriodsRepository>(RETAIL_PAYROLL_PERIODS_TYPES.Repository).to(RetailPayrollPeriodsRepository);
  options.bind<RetailPayrollPeriodsService>(RETAIL_PAYROLL_PERIODS_TYPES.Service).to(RetailPayrollPeriodsService);
  options.bind<RetailPayrollPeriodsController>(RETAIL_PAYROLL_PERIODS_TYPES.Controller).to(RetailPayrollPeriodsController);
  options.bind<RetailPayrollPeriodsRouter>(RETAIL_PAYROLL_PERIODS_TYPES.Router).to(RetailPayrollPeriodsRouter);
});
