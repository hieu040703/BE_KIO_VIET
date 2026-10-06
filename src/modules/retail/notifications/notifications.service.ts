import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailNotifications } from "@/database/models/retail/RetailGenericEntities";
import { RetailNotificationsRepository } from "./notifications.repository";
import { RETAIL_NOTIFICATIONS_TYPES } from "./notifications.types";

@injectable()
export class RetailNotificationsService extends BaseService<RetailNotifications> {
  constructor(@inject(RETAIL_NOTIFICATIONS_TYPES.Repository) repository: RetailNotificationsRepository) {
    super(repository);
  }
}
