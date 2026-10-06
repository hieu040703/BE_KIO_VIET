import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailSupplierDebtTransactions } from "@/database/models/retail/RetailGenericEntities";
import { RetailSupplierDebtTransactionsRepository } from "./supplierDebtTransactions.repository";
import { RETAIL_SUPPLIER_DEBT_TRANSACTIONS_TYPES } from "./supplierDebtTransactions.types";

@injectable()
export class RetailSupplierDebtTransactionsService extends BaseService<RetailSupplierDebtTransactions> {
  constructor(@inject(RETAIL_SUPPLIER_DEBT_TRANSACTIONS_TYPES.Repository) repository: RetailSupplierDebtTransactionsRepository) {
    super(repository);
  }
}
