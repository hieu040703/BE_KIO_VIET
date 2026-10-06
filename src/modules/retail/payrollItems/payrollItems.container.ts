import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPayrollItemsController } from "./payrollItems.controller";
import { RetailPayrollItemsRepository } from "./payrollItems.repository";
import { RetailPayrollItemsRouter } from "./payrollItems.route";
import { RetailPayrollItemsService } from "./payrollItems.service";
import { RETAIL_PAYROLL_ITEMS_TYPES } from "./payrollItems.types";

export const payrollItemsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPayrollItemsRepository>(RETAIL_PAYROLL_ITEMS_TYPES.Repository).to(RetailPayrollItemsRepository);
  options.bind<RetailPayrollItemsService>(RETAIL_PAYROLL_ITEMS_TYPES.Service).to(RetailPayrollItemsService);
  options.bind<RetailPayrollItemsController>(RETAIL_PAYROLL_ITEMS_TYPES.Controller).to(RetailPayrollItemsController);
  options.bind<RetailPayrollItemsRouter>(RETAIL_PAYROLL_ITEMS_TYPES.Router).to(RetailPayrollItemsRouter);
});
