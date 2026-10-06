import { injectable, inject } from "inversify";
import { RetailVoucherTransactionsService } from "./voucherTransactions.service";
import { RETAIL_VOUCHER_TRANSACTIONS_TYPES } from "./voucherTransactions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailVoucherTransactionsController extends BaseController<RetailVoucherTransactionsService> {
  constructor(@inject(RETAIL_VOUCHER_TRANSACTIONS_TYPES.Service) protected service: RetailVoucherTransactionsService) {
    super(service);
  }
}
