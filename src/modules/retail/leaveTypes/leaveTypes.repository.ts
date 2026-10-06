import { injectable } from "inversify";
import { RetailLeaveTypes } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { LEAVETYPES_RESOURCE } from "./leaveTypes.types";

@injectable()
export class RetailLeaveTypesRepository extends BaseRepository<RetailLeaveTypes> {
  protected entityClass = RetailLeaveTypes;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[LEAVETYPES_RESOURCE];
  }
}
