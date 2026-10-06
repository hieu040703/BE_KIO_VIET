import { injectable } from "inversify";
import { RetailPurchaseReturnItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PURCHASERETURNITEMS_RESOURCE } from "./purchaseReturnItems.types";

@injectable()
export class RetailPurchaseReturnItemsRepository extends BaseRepository<RetailPurchaseReturnItems> {
  protected entityClass = RetailPurchaseReturnItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PURCHASERETURNITEMS_RESOURCE];
  }
}
