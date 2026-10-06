import { injectable, inject } from "inversify";
import { BaseController } from "@/shared/base/BaseController";
import { AdminCustomerCareService } from "./admin.customerCare.service";
import { CUSTOMER_CARE_TYPES } from "./customerCare.types";

@injectable()
export class AdminCustomerCareController extends BaseController<AdminCustomerCareService> {
  constructor(
    @inject(CUSTOMER_CARE_TYPES.AdminCustomerCareService)
    protected service: AdminCustomerCareService,
  ) {
    super(service);
  }
}
