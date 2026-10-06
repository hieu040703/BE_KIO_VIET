import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { ZaloMessageHistoryService } from "./zaloMessageHistory.service";
import { ZaloMessageHistoryController } from "./zaloMessageHistory.controller";
import { ZaloMessageHistoryRepository } from "./zaloMessageHistory.repository";
import { AdminZaloMessageHistoryRouter } from "./zaloMessageHistory.route";
import { ZALO_MESSAGE_HISTORY_TYPES } from "./zaloMessageHistory.types";

const zaloMessageHistoryModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options
    .bind<ZaloMessageHistoryRepository>(ZALO_MESSAGE_HISTORY_TYPES.ZaloMessageHistoryRepository)
    .to(ZaloMessageHistoryRepository);
  options
    .bind<ZaloMessageHistoryService>(ZALO_MESSAGE_HISTORY_TYPES.ZaloMessageHistoryService)
    .to(ZaloMessageHistoryService);
  options
    .bind<ZaloMessageHistoryController>(ZALO_MESSAGE_HISTORY_TYPES.ZaloMessageHistoryController)
    .to(ZaloMessageHistoryController);
  options
    .bind<AdminZaloMessageHistoryRouter>(ZALO_MESSAGE_HISTORY_TYPES.AdminZaloMessageHistoryRouter)
    .to(AdminZaloMessageHistoryRouter);
});

export { zaloMessageHistoryModule };
