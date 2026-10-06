import { injectable } from "inversify";
import { RetailNotificationRecipients } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { NOTIFICATIONRECIPIENTS_RESOURCE } from "./notificationRecipients.types";

@injectable()
export class RetailNotificationRecipientsRepository extends BaseRepository<RetailNotificationRecipients> {
  protected entityClass = RetailNotificationRecipients;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[NOTIFICATIONRECIPIENTS_RESOURCE];
  }
}
