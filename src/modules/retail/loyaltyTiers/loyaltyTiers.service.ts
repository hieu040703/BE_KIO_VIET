import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailLoyaltyTiers } from "@/database/models/retail/RetailGenericEntities";
import { RetailLoyaltyTiersRepository } from "./loyaltyTiers.repository";
import { RETAIL_LOYALTY_TIERS_TYPES } from "./loyaltyTiers.types";

@injectable()
export class RetailLoyaltyTiersService extends BaseService<RetailLoyaltyTiers> {
  constructor(@inject(RETAIL_LOYALTY_TIERS_TYPES.Repository) repository: RetailLoyaltyTiersRepository) {
    super(repository);
  }
}
