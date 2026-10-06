import { injectable, inject } from "inversify";
import { RetailPayrollItemsService } from "./payrollItems.service";
import { RETAIL_PAYROLL_ITEMS_TYPES } from "./payrollItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPayrollItemsController extends BaseController<RetailPayrollItemsService> {
  constructor(@inject(RETAIL_PAYROLL_ITEMS_TYPES.Service) protected service: RetailPayrollItemsService) {
    super(service);
  }
}
