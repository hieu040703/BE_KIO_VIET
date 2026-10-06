import { injectable } from "inversify";
import { RetailFulfillmentItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { FULFILLMENTITEMS_RESOURCE } from "./fulfillmentItems.types";

@injectable()
export class RetailFulfillmentItemsRepository extends BaseRepository<RetailFulfillmentItems> {
  protected entityClass = RetailFulfillmentItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[FULFILLMENTITEMS_RESOURCE];
  }
}
