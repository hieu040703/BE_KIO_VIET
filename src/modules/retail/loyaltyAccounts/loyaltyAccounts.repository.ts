import { injectable } from "inversify";
import { RetailLoyaltyAccounts } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { LOYALTYACCOUNTS_RESOURCE } from "./loyaltyAccounts.types";

@injectable()
export class RetailLoyaltyAccountsRepository extends BaseRepository<RetailLoyaltyAccounts> {
  protected entityClass = RetailLoyaltyAccounts;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[LOYALTYACCOUNTS_RESOURCE];
  }
}
