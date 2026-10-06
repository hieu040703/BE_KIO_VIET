import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailJobsController } from "./jobs.controller";
import { RetailJobsRepository } from "./jobs.repository";
import { RetailJobsRouter } from "./jobs.route";
import { RetailJobsService } from "./jobs.service";
import { RETAIL_JOBS_TYPES } from "./jobs.types";

export const jobsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailJobsRepository>(RETAIL_JOBS_TYPES.Repository).to(RetailJobsRepository);
  options.bind<RetailJobsService>(RETAIL_JOBS_TYPES.Service).to(RetailJobsService);
  options.bind<RetailJobsController>(RETAIL_JOBS_TYPES.Controller).to(RetailJobsController);
  options.bind<RetailJobsRouter>(RETAIL_JOBS_TYPES.Router).to(RetailJobsRouter);
});
