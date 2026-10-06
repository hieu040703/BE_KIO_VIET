import { injectable } from "inversify";
import { RetailOvertimeRequests } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { OVERTIMEREQUESTS_RESOURCE } from "./overtimeRequests.types";

@injectable()
export class RetailOvertimeRequestsRepository extends BaseRepository<RetailOvertimeRequests> {
  protected entityClass = RetailOvertimeRequests;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[OVERTIMEREQUESTS_RESOURCE];
  }
}
