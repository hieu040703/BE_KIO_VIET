import { injectable, inject } from "inversify";
import { RetailEmployeeProfilesService } from "./employeeProfiles.service";
import { RETAIL_EMPLOYEE_PROFILES_TYPES } from "./employeeProfiles.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailEmployeeProfilesController extends BaseController<RetailEmployeeProfilesService> {
  constructor(@inject(RETAIL_EMPLOYEE_PROFILES_TYPES.Service) protected service: RetailEmployeeProfilesService) {
    super(service);
  }
}
