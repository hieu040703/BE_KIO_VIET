import { injectable, inject } from "inversify";
import { RetailCustomerDebtTransactionsService } from "./customerDebtTransactions.service";
import { RETAIL_CUSTOMER_DEBT_TRANSACTIONS_TYPES } from "./customerDebtTransactions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCustomerDebtTransactionsController extends BaseController<RetailCustomerDebtTransactionsService> {
  constructor(@inject(RETAIL_CUSTOMER_DEBT_TRANSACTIONS_TYPES.Service) protected service: RetailCustomerDebtTransactionsService) {
    super(service);
  }
}
