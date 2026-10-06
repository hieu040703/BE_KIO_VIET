import { injectable } from "inversify";
import { RetailPurchaseOrderItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PURCHASEORDERITEMS_RESOURCE } from "./purchaseOrderItems.types";

@injectable()
export class RetailPurchaseOrderItemsRepository extends BaseRepository<RetailPurchaseOrderItems> {
  protected entityClass = RetailPurchaseOrderItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PURCHASEORDERITEMS_RESOURCE];
  }
}
