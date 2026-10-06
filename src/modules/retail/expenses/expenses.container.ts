import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailExpensesController } from "./expenses.controller";
import { RetailExpensesRepository } from "./expenses.repository";
import { RetailExpensesRouter } from "./expenses.route";
import { RetailExpensesService } from "./expenses.service";
import { RETAIL_EXPENSES_TYPES } from "./expenses.types";

export const expensesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailExpensesRepository>(RETAIL_EXPENSES_TYPES.Repository).to(RetailExpensesRepository);
  options.bind<RetailExpensesService>(RETAIL_EXPENSES_TYPES.Service).to(RetailExpensesService);
  options.bind<RetailExpensesController>(RETAIL_EXPENSES_TYPES.Controller).to(RetailExpensesController);
  options.bind<RetailExpensesRouter>(RETAIL_EXPENSES_TYPES.Router).to(RetailExpensesRouter);
});
