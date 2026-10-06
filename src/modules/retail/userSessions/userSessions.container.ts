import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailUserSessionsController } from "./userSessions.controller";
import { RetailUserSessionsRepository } from "./userSessions.repository";
import { RetailUserSessionsRouter } from "./userSessions.route";
import { RetailUserSessionsService } from "./userSessions.service";
import { RETAIL_USER_SESSIONS_TYPES } from "./userSessions.types";

export const userSessionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailUserSessionsRepository>(RETAIL_USER_SESSIONS_TYPES.Repository).to(RetailUserSessionsRepository);
  options.bind<RetailUserSessionsService>(RETAIL_USER_SESSIONS_TYPES.Service).to(RetailUserSessionsService);
  options.bind<RetailUserSessionsController>(RETAIL_USER_SESSIONS_TYPES.Controller).to(RetailUserSessionsController);
  options.bind<RetailUserSessionsRouter>(RETAIL_USER_SESSIONS_TYPES.Router).to(RetailUserSessionsRouter);
});
