import { injectable } from "inversify";
import { RetailEmployeeCommissions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { EMPLOYEECOMMISSIONS_RESOURCE } from "./employeeCommissions.types";

@injectable()
export class RetailEmployeeCommissionsRepository extends BaseRepository<RetailEmployeeCommissions> {
  protected entityClass = RetailEmployeeCommissions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[EMPLOYEECOMMISSIONS_RESOURCE];
  }
}
