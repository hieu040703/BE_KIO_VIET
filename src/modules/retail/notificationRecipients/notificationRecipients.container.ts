import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailNotificationRecipientsController } from "./notificationRecipients.controller";
import { RetailNotificationRecipientsRepository } from "./notificationRecipients.repository";
import { RetailNotificationRecipientsRouter } from "./notificationRecipients.route";
import { RetailNotificationRecipientsService } from "./notificationRecipients.service";
import { RETAIL_NOTIFICATION_RECIPIENTS_TYPES } from "./notificationRecipients.types";

export const notificationRecipientsModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailNotificationRecipientsRepository>(RETAIL_NOTIFICATION_RECIPIENTS_TYPES.Repository).to(RetailNotificationRecipientsRepository);
  options.bind<RetailNotificationRecipientsService>(RETAIL_NOTIFICATION_RECIPIENTS_TYPES.Service).to(RetailNotificationRecipientsService);
  options.bind<RetailNotificationRecipientsController>(RETAIL_NOTIFICATION_RECIPIENTS_TYPES.Controller).to(RetailNotificationRecipientsController);
  options.bind<RetailNotificationRecipientsRouter>(RETAIL_NOTIFICATION_RECIPIENTS_TYPES.Router).to(RetailNotificationRecipientsRouter);
});
