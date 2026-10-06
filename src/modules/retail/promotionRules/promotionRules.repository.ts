import { injectable } from "inversify";
import { RetailPromotionRules } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PROMOTIONRULES_RESOURCE } from "./promotionRules.types";

@injectable()
export class RetailPromotionRulesRepository extends BaseRepository<RetailPromotionRules> {
  protected entityClass = RetailPromotionRules;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PROMOTIONRULES_RESOURCE];
  }
}
