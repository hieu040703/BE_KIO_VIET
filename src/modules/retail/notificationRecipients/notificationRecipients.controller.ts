import { injectable, inject } from "inversify";
import { RetailNotificationRecipientsService } from "./notificationRecipients.service";
import { RETAIL_NOTIFICATION_RECIPIENTS_TYPES } from "./notificationRecipients.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailNotificationRecipientsController extends BaseController<RetailNotificationRecipientsService> {
  constructor(@inject(RETAIL_NOTIFICATION_RECIPIENTS_TYPES.Service) protected service: RetailNotificationRecipientsService) {
    super(service);
  }
}
