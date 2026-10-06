import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailLeaveRequestsController } from "./leaveRequests.controller";
import { RetailLeaveRequestsRepository } from "./leaveRequests.repository";
import { RetailLeaveRequestsRouter } from "./leaveRequests.route";
import { RetailLeaveRequestsService } from "./leaveRequests.service";
import { RETAIL_LEAVE_REQUESTS_TYPES } from "./leaveRequests.types";

export const leaveRequestsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailLeaveRequestsRepository>(RETAIL_LEAVE_REQUESTS_TYPES.Repository).to(RetailLeaveRequestsRepository);
  options.bind<RetailLeaveRequestsService>(RETAIL_LEAVE_REQUESTS_TYPES.Service).to(RetailLeaveRequestsService);
  options.bind<RetailLeaveRequestsController>(RETAIL_LEAVE_REQUESTS_TYPES.Controller).to(RetailLeaveRequestsController);
  options.bind<RetailLeaveRequestsRouter>(RETAIL_LEAVE_REQUESTS_TYPES.Router).to(RetailLeaveRequestsRouter);
});
