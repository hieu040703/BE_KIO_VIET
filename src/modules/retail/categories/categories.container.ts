import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCategoriesController } from "./categories.controller";
import { RetailCategoriesRepository } from "./categories.repository";
import { RetailCategoriesRouter } from "./categories.route";
import { RetailCategoriesService } from "./categories.service";
import { RETAIL_CATEGORIES_TYPES } from "./categories.types";

export const categoriesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCategoriesRepository>(RETAIL_CATEGORIES_TYPES.Repository).to(RetailCategoriesRepository);
  options.bind<RetailCategoriesService>(RETAIL_CATEGORIES_TYPES.Service).to(RetailCategoriesService);
  options.bind<RetailCategoriesController>(RETAIL_CATEGORIES_TYPES.Controller).to(RetailCategoriesController);
  options.bind<RetailCategoriesRouter>(RETAIL_CATEGORIES_TYPES.Router).to(RetailCategoriesRouter);
});
