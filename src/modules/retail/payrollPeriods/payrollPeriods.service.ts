import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPayrollPeriods } from "@/database/models/retail/RetailGenericEntities";
import { RetailPayrollPeriodsRepository } from "./payrollPeriods.repository";
import { RETAIL_PAYROLL_PERIODS_TYPES } from "./payrollPeriods.types";

@injectable()
export class RetailPayrollPeriodsService extends BaseService<RetailPayrollPeriods> {
  constructor(@inject(RETAIL_PAYROLL_PERIODS_TYPES.Repository) repository: RetailPayrollPeriodsRepository) {
    super(repository);
  }
}
