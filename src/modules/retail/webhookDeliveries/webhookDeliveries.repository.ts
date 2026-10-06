import { injectable } from "inversify";
import { RetailWebhookDeliveries } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { WEBHOOKDELIVERIES_RESOURCE } from "./webhookDeliveries.types";

@injectable()
export class RetailWebhookDeliveriesRepository extends BaseRepository<RetailWebhookDeliveries> {
  protected entityClass = RetailWebhookDeliveries;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[WEBHOOKDELIVERIES_RESOURCE];
  }
}
