import { injectable } from "inversify";
import { RetailOrderStatusHistory } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ORDERSTATUSHISTORY_RESOURCE } from "./orderStatusHistory.types";

@injectable()
export class RetailOrderStatusHistoryRepository extends BaseRepository<RetailOrderStatusHistory> {
  protected entityClass = RetailOrderStatusHistory;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ORDERSTATUSHISTORY_RESOURCE];
  }
}
