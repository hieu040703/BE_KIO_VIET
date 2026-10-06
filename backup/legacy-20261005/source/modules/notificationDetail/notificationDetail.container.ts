import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { NotificationDetailController } from "./notificationDetail.controller";
import { NotificationDetailService } from "./notificationDetail.service";
import { NotificationDetailRepository } from "./notificationDetail.repository";
import { AdminNotificationDetailRouter } from "./admin.notificationDetail.route";
import { ClientNotificationDetailRouter } from "./client.notificationDetail.route";
import { NOTIFICATION_DETAIL_TYPES } from "./notificationDetail.types";

const notificationDetailModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options
    .bind<NotificationDetailService>(NOTIFICATION_DETAIL_TYPES.NotificationDetailService)
    .to(NotificationDetailService);
  options
    .bind<NotificationDetailController>(NOTIFICATION_DETAIL_TYPES.NotificationDetailController)
    .to(NotificationDetailController);
  options
    .bind<NotificationDetailRepository>(NOTIFICATION_DETAIL_TYPES.NotificationDetailRepository)
    .to(NotificationDetailRepository);
  options
    .bind<AdminNotificationDetailRouter>(NOTIFICATION_DETAIL_TYPES.AdminNotificationDetailRouter)
    .to(AdminNotificationDetailRouter);
  options
    .bind<ClientNotificationDetailRouter>(NOTIFICATION_DETAIL_TYPES.ClientNotificationDetailRouter)
    .to(ClientNotificationDetailRouter);
});

export { notificationDetailModule };
