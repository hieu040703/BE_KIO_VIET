import { injectable, inject } from "inversify";
import { RetailCustomerDebtsService } from "./customerDebts.service";
import { RETAIL_CUSTOMER_DEBTS_TYPES } from "./customerDebts.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCustomerDebtsController extends BaseController<RetailCustomerDebtsService> {
  constructor(@inject(RETAIL_CUSTOMER_DEBTS_TYPES.Service) protected service: RetailCustomerDebtsService) {
    super(service);
  }
}
