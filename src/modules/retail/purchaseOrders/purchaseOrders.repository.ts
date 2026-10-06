import { injectable } from "inversify";
import { RetailPurchaseOrders } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PURCHASEORDERS_RESOURCE } from "./purchaseOrders.types";

@injectable()
export class RetailPurchaseOrdersRepository extends BaseRepository<RetailPurchaseOrders> {
  protected entityClass = RetailPurchaseOrders;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PURCHASEORDERS_RESOURCE];
  }
}
