import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPaymentTransactions } from "@/database/models/retail/RetailGenericEntities";
import { RetailPaymentTransactionsRepository } from "./paymentTransactions.repository";
import { RETAIL_PAYMENT_TRANSACTIONS_TYPES } from "./paymentTransactions.types";

@injectable()
export class RetailPaymentTransactionsService extends BaseService<RetailPaymentTransactions> {
  constructor(@inject(RETAIL_PAYMENT_TRANSACTIONS_TYPES.Repository) repository: RetailPaymentTransactionsRepository) {
    super(repository);
  }
}
