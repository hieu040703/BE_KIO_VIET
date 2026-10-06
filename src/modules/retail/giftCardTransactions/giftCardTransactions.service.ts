import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailGiftCardTransactions } from "@/database/models/retail/RetailGenericEntities";
import { RetailGiftCardTransactionsRepository } from "./giftCardTransactions.repository";
import { RETAIL_GIFT_CARD_TRANSACTIONS_TYPES } from "./giftCardTransactions.types";

@injectable()
export class RetailGiftCardTransactionsService extends BaseService<RetailGiftCardTransactions> {
  constructor(@inject(RETAIL_GIFT_CARD_TRANSACTIONS_TYPES.Repository) repository: RetailGiftCardTransactionsRepository) {
    super(repository);
  }
}
