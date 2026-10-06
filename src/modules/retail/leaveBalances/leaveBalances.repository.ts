import { injectable } from "inversify";
import { RetailLeaveBalances } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { LEAVEBALANCES_RESOURCE } from "./leaveBalances.types";

@injectable()
export class RetailLeaveBalancesRepository extends BaseRepository<RetailLeaveBalances> {
  protected entityClass = RetailLeaveBalances;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[LEAVEBALANCES_RESOURCE];
  }
}
