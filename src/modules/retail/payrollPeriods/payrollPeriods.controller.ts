import { injectable, inject } from "inversify";
import { RetailPayrollPeriodsService } from "./payrollPeriods.service";
import { RETAIL_PAYROLL_PERIODS_TYPES } from "./payrollPeriods.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPayrollPeriodsController extends BaseController<RetailPayrollPeriodsService> {
  constructor(@inject(RETAIL_PAYROLL_PERIODS_TYPES.Service) protected service: RetailPayrollPeriodsService) {
    super(service);
  }
}
