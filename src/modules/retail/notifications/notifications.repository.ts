import { injectable } from "inversify";
import { RetailNotifications } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { NOTIFICATIONS_RESOURCE } from "./notifications.types";

@injectable()
export class RetailNotificationsRepository extends BaseRepository<RetailNotifications> {
  protected entityClass = RetailNotifications;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[NOTIFICATIONS_RESOURCE];
  }
}
