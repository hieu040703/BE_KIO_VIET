import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCustomerDebtTransactions } from "@/database/models/retail/RetailGenericEntities";
import { RetailCustomerDebtTransactionsRepository } from "./customerDebtTransactions.repository";
import { RETAIL_CUSTOMER_DEBT_TRANSACTIONS_TYPES } from "./customerDebtTransactions.types";

@injectable()
export class RetailCustomerDebtTransactionsService extends BaseService<RetailCustomerDebtTransactions> {
  constructor(@inject(RETAIL_CUSTOMER_DEBT_TRANSACTIONS_TYPES.Repository) repository: RetailCustomerDebtTransactionsRepository) {
    super(repository);
  }
}
