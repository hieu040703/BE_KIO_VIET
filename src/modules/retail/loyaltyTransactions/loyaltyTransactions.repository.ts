import { injectable } from "inversify";
import { RetailLoyaltyTransactions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { LOYALTYTRANSACTIONS_RESOURCE } from "./loyaltyTransactions.types";

@injectable()
export class RetailLoyaltyTransactionsRepository extends BaseRepository<RetailLoyaltyTransactions> {
  protected entityClass = RetailLoyaltyTransactions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[LOYALTYTRANSACTIONS_RESOURCE];
  }
}
