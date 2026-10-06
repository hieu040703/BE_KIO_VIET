import { injectable, inject } from "inversify";
import { RetailLoyaltyTransactionsService } from "./loyaltyTransactions.service";
import { RETAIL_LOYALTY_TRANSACTIONS_TYPES } from "./loyaltyTransactions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailLoyaltyTransactionsController extends BaseController<RetailLoyaltyTransactionsService> {
  constructor(@inject(RETAIL_LOYALTY_TRANSACTIONS_TYPES.Service) protected service: RetailLoyaltyTransactionsService) {
    super(service);
  }
}
