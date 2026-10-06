import { injectable } from "inversify";
import { RetailEmployeeBranchAssignments } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { EMPLOYEEBRANCHASSIGNMENTS_RESOURCE } from "./employeeBranchAssignments.types";

@injectable()
export class RetailEmployeeBranchAssignmentsRepository extends BaseRepository<RetailEmployeeBranchAssignments> {
  protected entityClass = RetailEmployeeBranchAssignments;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[EMPLOYEEBRANCHASSIGNMENTS_RESOURCE];
  }
}
