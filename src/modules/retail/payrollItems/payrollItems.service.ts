import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPayrollItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailPayrollItemsRepository } from "./payrollItems.repository";
import { RETAIL_PAYROLL_ITEMS_TYPES } from "./payrollItems.types";

@injectable()
export class RetailPayrollItemsService extends BaseService<RetailPayrollItems> {
  constructor(@inject(RETAIL_PAYROLL_ITEMS_TYPES.Repository) repository: RetailPayrollItemsRepository) {
    super(repository);
  }
}
