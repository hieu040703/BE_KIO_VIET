import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailEmployeeCommissions } from "@/database/models/retail/RetailGenericEntities";
import { RetailEmployeeCommissionsRepository } from "./employeeCommissions.repository";
import { RETAIL_EMPLOYEE_COMMISSIONS_TYPES } from "./employeeCommissions.types";

@injectable()
export class RetailEmployeeCommissionsService extends BaseService<RetailEmployeeCommissions> {
  constructor(@inject(RETAIL_EMPLOYEE_COMMISSIONS_TYPES.Repository) repository: RetailEmployeeCommissionsRepository) {
    super(repository);
  }
}
