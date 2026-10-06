import { injectable } from "inversify";
import { RetailLeaveRequests } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { LEAVEREQUESTS_RESOURCE } from "./leaveRequests.types";

@injectable()
export class RetailLeaveRequestsRepository extends BaseRepository<RetailLeaveRequests> {
  protected entityClass = RetailLeaveRequests;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[LEAVEREQUESTS_RESOURCE];
  }
}
