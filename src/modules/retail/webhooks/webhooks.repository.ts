import { injectable } from "inversify";
import { RetailWebhooks } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { WEBHOOKS_RESOURCE } from "./webhooks.types";

@injectable()
export class RetailWebhooksRepository extends BaseRepository<RetailWebhooks> {
  protected entityClass = RetailWebhooks;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[WEBHOOKS_RESOURCE];
  }
}
