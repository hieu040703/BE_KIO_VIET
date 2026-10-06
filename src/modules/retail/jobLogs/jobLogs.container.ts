import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailJobLogsController } from "./jobLogs.controller";
import { RetailJobLogsRepository } from "./jobLogs.repository";
import { RetailJobLogsRouter } from "./jobLogs.route";
import { RetailJobLogsService } from "./jobLogs.service";
import { RETAIL_JOB_LOGS_TYPES } from "./jobLogs.types";

export const jobLogsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailJobLogsRepository>(RETAIL_JOB_LOGS_TYPES.Repository).to(RetailJobLogsRepository);
  options.bind<RetailJobLogsService>(RETAIL_JOB_LOGS_TYPES.Service).to(RetailJobLogsService);
  options.bind<RetailJobLogsController>(RETAIL_JOB_LOGS_TYPES.Controller).to(RetailJobLogsController);
  options.bind<RetailJobLogsRouter>(RETAIL_JOB_LOGS_TYPES.Router).to(RetailJobLogsRouter);
});
