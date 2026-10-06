import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { AdminCallHistoryController } from "./admin.callHistory.controller";
import { ClientCallHistoryController } from "./client.callHistory.controller";
import { AdminCallHistoryService } from "./admin.callHistory.service";
import { ClientCallHistoryService } from "./client.callHistory.service";
import { ClientCallHistoryRepository } from "./client.callHistory.repository";
import { AdminCallHistoryRepository } from "./admin.callHistory.repository";
import { AdminCallHistoryRouter } from "./admin.callHistory.route";
import { ClientCallHistoryRouter } from "./client.callHistory.route";
import { CALL_HISTORY_TYPES } from "./callHistory.types";

const callHistoryModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<AdminCallHistoryService>(CALL_HISTORY_TYPES.AdminCallHistoryService).to(AdminCallHistoryService);
  options
    .bind<AdminCallHistoryController>(CALL_HISTORY_TYPES.AdminCallHistoryController)
    .to(AdminCallHistoryController);
  options.bind<AdminCallHistoryRouter>(CALL_HISTORY_TYPES.AdminCallHistoryRouter).to(AdminCallHistoryRouter);

  options.bind<ClientCallHistoryService>(CALL_HISTORY_TYPES.ClientCallHistoryService).to(ClientCallHistoryService);
  options
    .bind<ClientCallHistoryController>(CALL_HISTORY_TYPES.ClientCallHistoryController)
    .to(ClientCallHistoryController);
  options.bind<ClientCallHistoryRouter>(CALL_HISTORY_TYPES.ClientCallHistoryRouter).to(ClientCallHistoryRouter);
  options
    .bind<ClientCallHistoryRepository>(CALL_HISTORY_TYPES.ClientCallHistoryRepository)
    .to(ClientCallHistoryRepository);
  options
    .bind<AdminCallHistoryRepository>(CALL_HISTORY_TYPES.AdminCallHistoryRepository)
    .to(AdminCallHistoryRepository);
});

export { callHistoryModule };
