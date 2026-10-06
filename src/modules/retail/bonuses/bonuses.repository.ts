import { injectable } from "inversify";
import { RetailBonuses } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { BONUSES_RESOURCE } from "./bonuses.types";

@injectable()
export class RetailBonusesRepository extends BaseRepository<RetailBonuses> {
  protected entityClass = RetailBonuses;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[BONUSES_RESOURCE];
  }
}
