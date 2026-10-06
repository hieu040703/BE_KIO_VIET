import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailEmployeeDocumentsController } from "./employeeDocuments.controller";
import { RetailEmployeeDocumentsRepository } from "./employeeDocuments.repository";
import { RetailEmployeeDocumentsRouter } from "./employeeDocuments.route";
import { RetailEmployeeDocumentsService } from "./employeeDocuments.service";
import { RETAIL_EMPLOYEE_DOCUMENTS_TYPES } from "./employeeDocuments.types";

export const employeeDocumentsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailEmployeeDocumentsRepository>(RETAIL_EMPLOYEE_DOCUMENTS_TYPES.Repository).to(RetailEmployeeDocumentsRepository);
  options.bind<RetailEmployeeDocumentsService>(RETAIL_EMPLOYEE_DOCUMENTS_TYPES.Service).to(RetailEmployeeDocumentsService);
  options.bind<RetailEmployeeDocumentsController>(RETAIL_EMPLOYEE_DOCUMENTS_TYPES.Controller).to(RetailEmployeeDocumentsController);
  options.bind<RetailEmployeeDocumentsRouter>(RETAIL_EMPLOYEE_DOCUMENTS_TYPES.Router).to(RetailEmployeeDocumentsRouter);
});
