import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailVoucherTransactions } from "@/database/models/retail/RetailGenericEntities";
import { RetailVoucherTransactionsRepository } from "./voucherTransactions.repository";
import { RETAIL_VOUCHER_TRANSACTIONS_TYPES } from "./voucherTransactions.types";

@injectable()
export class RetailVoucherTransactionsService extends BaseService<RetailVoucherTransactions> {
  constructor(@inject(RETAIL_VOUCHER_TRANSACTIONS_TYPES.Repository) repository: RetailVoucherTransactionsRepository) {
    super(repository);
  }
}
