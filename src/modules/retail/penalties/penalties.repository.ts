import { injectable } from "inversify";
import { RetailPenalties } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PENALTIES_RESOURCE } from "./penalties.types";

@injectable()
export class RetailPenaltiesRepository extends BaseRepository<RetailPenalties> {
  protected entityClass = RetailPenalties;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PENALTIES_RESOURCE];
  }
}
