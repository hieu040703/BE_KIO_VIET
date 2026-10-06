import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCashSessionsController } from "./cashSessions.controller";
import { RetailCashSessionsRepository } from "./cashSessions.repository";
import { RetailCashSessionsRouter } from "./cashSessions.route";
import { RetailCashSessionsService } from "./cashSessions.service";
import { RETAIL_CASH_SESSIONS_TYPES } from "./cashSessions.types";

export const cashSessionsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCashSessionsRepository>(RETAIL_CASH_SESSIONS_TYPES.Repository).to(RetailCashSessionsRepository);
  options.bind<RetailCashSessionsService>(RETAIL_CASH_SESSIONS_TYPES.Service).to(RetailCashSessionsService);
  options.bind<RetailCashSessionsController>(RETAIL_CASH_SESSIONS_TYPES.Controller).to(RetailCashSessionsController);
  options.bind<RetailCashSessionsRouter>(RETAIL_CASH_SESSIONS_TYPES.Router).to(RetailCashSessionsRouter);
});
