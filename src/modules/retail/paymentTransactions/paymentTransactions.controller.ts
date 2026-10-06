import { injectable, inject } from "inversify";
import { RetailPaymentTransactionsService } from "./paymentTransactions.service";
import { RETAIL_PAYMENT_TRANSACTIONS_TYPES } from "./paymentTransactions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPaymentTransactionsController extends BaseController<RetailPaymentTransactionsService> {
  constructor(@inject(RETAIL_PAYMENT_TRANSACTIONS_TYPES.Service) protected service: RetailPaymentTransactionsService) {
    super(service);
  }
}
