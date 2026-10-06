import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailWebhookDeliveries } from "@/database/models/retail/RetailGenericEntities";
import { RetailWebhookDeliveriesRepository } from "./webhookDeliveries.repository";
import { RETAIL_WEBHOOK_DELIVERIES_TYPES } from "./webhookDeliveries.types";

@injectable()
export class RetailWebhookDeliveriesService extends BaseService<RetailWebhookDeliveries> {
  constructor(@inject(RETAIL_WEBHOOK_DELIVERIES_TYPES.Repository) repository: RetailWebhookDeliveriesRepository) {
    super(repository);
  }
}
