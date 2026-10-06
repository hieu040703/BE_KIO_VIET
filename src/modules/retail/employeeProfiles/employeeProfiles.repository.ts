import { injectable } from "inversify";
import { RetailEmployeeProfiles } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { EMPLOYEEPROFILES_RESOURCE } from "./employeeProfiles.types";

@injectable()
export class RetailEmployeeProfilesRepository extends BaseRepository<RetailEmployeeProfiles> {
  protected entityClass = RetailEmployeeProfiles;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[EMPLOYEEPROFILES_RESOURCE];
  }
}
