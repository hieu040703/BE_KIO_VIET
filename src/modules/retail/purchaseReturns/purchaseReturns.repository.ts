import { injectable } from "inversify";
import { RetailPurchaseReturns } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PURCHASERETURNS_RESOURCE } from "./purchaseReturns.types";

@injectable()
export class RetailPurchaseReturnsRepository extends BaseRepository<RetailPurchaseReturns> {
  protected entityClass = RetailPurchaseReturns;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PURCHASERETURNS_RESOURCE];
  }
}
