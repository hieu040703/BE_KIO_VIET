import { injectable } from "inversify";
import { RetailLoyaltyTiers } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { LOYALTYTIERS_RESOURCE } from "./loyaltyTiers.types";

@injectable()
export class RetailLoyaltyTiersRepository extends BaseRepository<RetailLoyaltyTiers> {
  protected entityClass = RetailLoyaltyTiers;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[LOYALTYTIERS_RESOURCE];
  }
}
