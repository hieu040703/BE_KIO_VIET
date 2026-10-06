import { injectable } from "inversify";
import { RetailShiftAssignments } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { SHIFTASSIGNMENTS_RESOURCE } from "./shiftAssignments.types";

@injectable()
export class RetailShiftAssignmentsRepository extends BaseRepository<RetailShiftAssignments> {
  protected entityClass = RetailShiftAssignments;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[SHIFTASSIGNMENTS_RESOURCE];
  }
}
