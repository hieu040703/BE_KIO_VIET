import { injectable, inject } from "inversify";
import { RetailSupplierDebtTransactionsService } from "./supplierDebtTransactions.service";
import { RETAIL_SUPPLIER_DEBT_TRANSACTIONS_TYPES } from "./supplierDebtTransactions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailSupplierDebtTransactionsController extends BaseController<RetailSupplierDebtTransactionsService> {
  constructor(@inject(RETAIL_SUPPLIER_DEBT_TRANSACTIONS_TYPES.Service) protected service: RetailSupplierDebtTransactionsService) {
    super(service);
  }
}
