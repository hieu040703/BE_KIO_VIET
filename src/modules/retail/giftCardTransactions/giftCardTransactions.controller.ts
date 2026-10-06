import { injectable, inject } from "inversify";
import { RetailGiftCardTransactionsService } from "./giftCardTransactions.service";
import { RETAIL_GIFT_CARD_TRANSACTIONS_TYPES } from "./giftCardTransactions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailGiftCardTransactionsController extends BaseController<RetailGiftCardTransactionsService> {
  constructor(@inject(RETAIL_GIFT_CARD_TRANSACTIONS_TYPES.Service) protected service: RetailGiftCardTransactionsService) {
    super(service);
  }
}
