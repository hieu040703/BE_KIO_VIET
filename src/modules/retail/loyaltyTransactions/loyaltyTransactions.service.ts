import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailLoyaltyTransactions } from "@/database/models/retail/RetailGenericEntities";
import { RetailLoyaltyTransactionsRepository } from "./loyaltyTransactions.repository";
import { RETAIL_LOYALTY_TRANSACTIONS_TYPES } from "./loyaltyTransactions.types";

@injectable()
export class RetailLoyaltyTransactionsService extends BaseService<RetailLoyaltyTransactions> {
  constructor(@inject(RETAIL_LOYALTY_TRANSACTIONS_TYPES.Repository) repository: RetailLoyaltyTransactionsRepository) {
    super(repository);
  }
}
