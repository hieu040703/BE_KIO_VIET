import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailNotificationsController } from "./notifications.controller";
import { RetailNotificationsRepository } from "./notifications.repository";
import { RetailNotificationsRouter } from "./notifications.route";
import { RetailNotificationsService } from "./notifications.service";
import { RETAIL_NOTIFICATIONS_TYPES } from "./notifications.types";

export const notificationsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailNotificationsRepository>(RETAIL_NOTIFICATIONS_TYPES.Repository).to(RetailNotificationsRepository);
  options.bind<RetailNotificationsService>(RETAIL_NOTIFICATIONS_TYPES.Service).to(RetailNotificationsService);
  options.bind<RetailNotificationsController>(RETAIL_NOTIFICATIONS_TYPES.Controller).to(RetailNotificationsController);
  options.bind<RetailNotificationsRouter>(RETAIL_NOTIFICATIONS_TYPES.Router).to(RetailNotificationsRouter);
});
