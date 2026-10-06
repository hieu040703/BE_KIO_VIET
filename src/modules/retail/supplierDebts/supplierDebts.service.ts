import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailSupplierDebts } from "@/database/models/retail/RetailGenericEntities";
import { RetailSupplierDebtsRepository } from "./supplierDebts.repository";
import { RETAIL_SUPPLIER_DEBTS_TYPES } from "./supplierDebts.types";

@injectable()
export class RetailSupplierDebtsService extends BaseService<RetailSupplierDebts> {
  constructor(@inject(RETAIL_SUPPLIER_DEBTS_TYPES.Repository) repository: RetailSupplierDebtsRepository) {
    super(repository);
  }
}
