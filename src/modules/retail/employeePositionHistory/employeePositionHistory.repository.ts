import { injectable } from "inversify";
import { RetailEmployeePositionHistory } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { EMPLOYEEPOSITIONHISTORY_RESOURCE } from "./employeePositionHistory.types";

@injectable()
export class RetailEmployeePositionHistoryRepository extends BaseRepository<RetailEmployeePositionHistory> {
  protected entityClass = RetailEmployeePositionHistory;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[EMPLOYEEPOSITIONHISTORY_RESOURCE];
  }
}
