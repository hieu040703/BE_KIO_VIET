import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailLoyaltyAccounts } from "@/database/models/retail/RetailGenericEntities";
import { RetailLoyaltyAccountsRepository } from "./loyaltyAccounts.repository";
import { RETAIL_LOYALTY_ACCOUNTS_TYPES } from "./loyaltyAccounts.types";

@injectable()
export class RetailLoyaltyAccountsService extends BaseService<RetailLoyaltyAccounts> {
  constructor(@inject(RETAIL_LOYALTY_ACCOUNTS_TYPES.Repository) repository: RetailLoyaltyAccountsRepository) {
    super(repository);
  }
}
