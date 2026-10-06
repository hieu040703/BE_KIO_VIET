import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailNotificationRecipients } from "@/database/models/retail/RetailGenericEntities";
import { RetailNotificationRecipientsRepository } from "./notificationRecipients.repository";
import { RETAIL_NOTIFICATION_RECIPIENTS_TYPES } from "./notificationRecipients.types";

@injectable()
export class RetailNotificationRecipientsService extends BaseService<RetailNotificationRecipients> {
  constructor(@inject(RETAIL_NOTIFICATION_RECIPIENTS_TYPES.Repository) repository: RetailNotificationRecipientsRepository) {
    super(repository);
  }
}
