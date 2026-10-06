import { injectable } from "inversify";
import { RetailCashSessions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CASHSESSIONS_RESOURCE } from "./cashSessions.types";

@injectable()
export class RetailCashSessionsRepository extends BaseRepository<RetailCashSessions> {
  protected entityClass = RetailCashSessions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CASHSESSIONS_RESOURCE];
  }
}
