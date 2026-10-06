import { injectable, inject } from "inversify";
import { RetailWebhookDeliveriesService } from "./webhookDeliveries.service";
import { RETAIL_WEBHOOK_DELIVERIES_TYPES } from "./webhookDeliveries.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailWebhookDeliveriesController extends BaseController<RetailWebhookDeliveriesService> {
  constructor(@inject(RETAIL_WEBHOOK_DELIVERIES_TYPES.Service) protected service: RetailWebhookDeliveriesService) {
    super(service);
  }
}
