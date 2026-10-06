import { Container, ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { NotificationRepository } from "./notification.repository";
import { NotificationRouter } from "./notification.route";
import { NOTIFICATION_TYPES } from "./notification.types";

const notificationModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<NotificationService>(NOTIFICATION_TYPES.NotificationService).to(NotificationService);
  options.bind<NotificationController>(NOTIFICATION_TYPES.NotificationController).to(NotificationController);
  options.bind<NotificationRepository>(NOTIFICATION_TYPES.NotificationRepository).to(NotificationRepository);
  options.bind<NotificationRouter>(NOTIFICATION_TYPES.NotificationRouter).to(NotificationRouter);
});

export { notificationModule };
