import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailEmployeeProfiles } from "@/database/models/retail/RetailGenericEntities";
import { RetailEmployeeProfilesRepository } from "./employeeProfiles.repository";
import { RETAIL_EMPLOYEE_PROFILES_TYPES } from "./employeeProfiles.types";

@injectable()
export class RetailEmployeeProfilesService extends BaseService<RetailEmployeeProfiles> {
  constructor(@inject(RETAIL_EMPLOYEE_PROFILES_TYPES.Repository) repository: RetailEmployeeProfilesRepository) {
    super(repository);
  }
}
