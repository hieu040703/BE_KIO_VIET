import { injectable, inject } from "inversify";
import { RetailNotificationsService } from "./notifications.service";
import { RETAIL_NOTIFICATIONS_TYPES } from "./notifications.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailNotificationsController extends BaseController<RetailNotificationsService> {
  constructor(@inject(RETAIL_NOTIFICATIONS_TYPES.Service) protected service: RetailNotificationsService) {
    super(service);
  }
}
