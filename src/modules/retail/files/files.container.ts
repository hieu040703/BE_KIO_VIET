import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailFilesController } from "./files.controller";
import { RetailFilesRepository } from "./files.repository";
import { RetailFilesRouter } from "./files.route";
import { RetailFilesService } from "./files.service";
import { RETAIL_FILES_TYPES } from "./files.types";

export const filesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailFilesRepository>(RETAIL_FILES_TYPES.Repository).to(RetailFilesRepository);
  options.bind<RetailFilesService>(RETAIL_FILES_TYPES.Service).to(RetailFilesService);
  options.bind<RetailFilesController>(RETAIL_FILES_TYPES.Controller).to(RetailFilesController);
  options.bind<RetailFilesRouter>(RETAIL_FILES_TYPES.Router).to(RetailFilesRouter);
});
