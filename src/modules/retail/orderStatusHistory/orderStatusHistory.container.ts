import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailOrderStatusHistoryController } from "./orderStatusHistory.controller";
import { RetailOrderStatusHistoryRepository } from "./orderStatusHistory.repository";
import { RetailOrderStatusHistoryRouter } from "./orderStatusHistory.route";
import { RetailOrderStatusHistoryService } from "./orderStatusHistory.service";
import { RETAIL_ORDER_STATUS_HISTORY_TYPES } from "./orderStatusHistory.types";

export const orderStatusHistoryModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailOrderStatusHistoryRepository>(RETAIL_ORDER_STATUS_HISTORY_TYPES.Repository).to(RetailOrderStatusHistoryRepository);
  options.bind<RetailOrderStatusHistoryService>(RETAIL_ORDER_STATUS_HISTORY_TYPES.Service).to(RetailOrderStatusHistoryService);
  options.bind<RetailOrderStatusHistoryController>(RETAIL_ORDER_STATUS_HISTORY_TYPES.Controller).to(RetailOrderStatusHistoryController);
  options.bind<RetailOrderStatusHistoryRouter>(RETAIL_ORDER_STATUS_HISTORY_TYPES.Router).to(RetailOrderStatusHistoryRouter);
});
