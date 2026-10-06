import { injectable, inject } from "inversify";
import { RetailEmployeeCommissionsService } from "./employeeCommissions.service";
import { RETAIL_EMPLOYEE_COMMISSIONS_TYPES } from "./employeeCommissions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailEmployeeCommissionsController extends BaseController<RetailEmployeeCommissionsService> {
  constructor(@inject(RETAIL_EMPLOYEE_COMMISSIONS_TYPES.Service) protected service: RetailEmployeeCommissionsService) {
    super(service);
  }
}
