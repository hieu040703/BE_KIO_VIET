import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailExpenseCategoriesController } from "./expenseCategories.controller";
import { RetailExpenseCategoriesRepository } from "./expenseCategories.repository";
import { RetailExpenseCategoriesRouter } from "./expenseCategories.route";
import { RetailExpenseCategoriesService } from "./expenseCategories.service";
import { RETAIL_EXPENSE_CATEGORIES_TYPES } from "./expenseCategories.types";

export const expenseCategoriesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailExpenseCategoriesRepository>(RETAIL_EXPENSE_CATEGORIES_TYPES.Repository).to(RetailExpenseCategoriesRepository);
  options.bind<RetailExpenseCategoriesService>(RETAIL_EXPENSE_CATEGORIES_TYPES.Service).to(RetailExpenseCategoriesService);
  options.bind<RetailExpenseCategoriesController>(RETAIL_EXPENSE_CATEGORIES_TYPES.Controller).to(RetailExpenseCategoriesController);
  options.bind<RetailExpenseCategoriesRouter>(RETAIL_EXPENSE_CATEGORIES_TYPES.Router).to(RetailExpenseCategoriesRouter);
});
