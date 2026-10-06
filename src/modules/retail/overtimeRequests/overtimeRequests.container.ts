import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailOvertimeRequestsController } from "./overtimeRequests.controller";
import { RetailOvertimeRequestsRepository } from "./overtimeRequests.repository";
import { RetailOvertimeRequestsRouter } from "./overtimeRequests.route";
import { RetailOvertimeRequestsService } from "./overtimeRequests.service";
import { RETAIL_OVERTIME_REQUESTS_TYPES } from "./overtimeRequests.types";

export const overtimeRequestsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailOvertimeRequestsRepository>(RETAIL_OVERTIME_REQUESTS_TYPES.Repository).to(RetailOvertimeRequestsRepository);
  options.bind<RetailOvertimeRequestsService>(RETAIL_OVERTIME_REQUESTS_TYPES.Service).to(RetailOvertimeRequestsService);
  options.bind<RetailOvertimeRequestsController>(RETAIL_OVERTIME_REQUESTS_TYPES.Controller).to(RetailOvertimeRequestsController);
  options.bind<RetailOvertimeRequestsRouter>(RETAIL_OVERTIME_REQUESTS_TYPES.Router).to(RetailOvertimeRequestsRouter);
});
