import { injectable, inject } from "inversify";
import { RetailPayrollsService } from "./payrolls.service";
import { RETAIL_PAYROLLS_TYPES } from "./payrolls.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPayrollsController extends BaseController<RetailPayrollsService> {
  constructor(@inject(RETAIL_PAYROLLS_TYPES.Service) protected service: RetailPayrollsService) {
    super(service);
  }
}
