import { injectable, inject } from "inversify";
import { RetailSupplierDebtsService } from "./supplierDebts.service";
import { RETAIL_SUPPLIER_DEBTS_TYPES } from "./supplierDebts.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailSupplierDebtsController extends BaseController<RetailSupplierDebtsService> {
  constructor(@inject(RETAIL_SUPPLIER_DEBTS_TYPES.Service) protected service: RetailSupplierDebtsService) {
    super(service);
  }
}
