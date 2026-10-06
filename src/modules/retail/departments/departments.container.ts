import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailDepartmentsController } from "./departments.controller";
import { RetailDepartmentsRepository } from "./departments.repository";
import { RetailDepartmentsRouter } from "./departments.route";
import { RetailDepartmentsService } from "./departments.service";
import { RETAIL_DEPARTMENTS_TYPES } from "./departments.types";

export const departmentsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailDepartmentsRepository>(RETAIL_DEPARTMENTS_TYPES.Repository).to(RetailDepartmentsRepository);
  options.bind<RetailDepartmentsService>(RETAIL_DEPARTMENTS_TYPES.Service).to(RetailDepartmentsService);
  options.bind<RetailDepartmentsController>(RETAIL_DEPARTMENTS_TYPES.Controller).to(RetailDepartmentsController);
  options.bind<RetailDepartmentsRouter>(RETAIL_DEPARTMENTS_TYPES.Router).to(RetailDepartmentsRouter);
});
