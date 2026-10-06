import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPromotionRules } from "@/database/models/retail/RetailGenericEntities";
import { RetailPromotionRulesRepository } from "./promotionRules.repository";
import { RETAIL_PROMOTION_RULES_TYPES } from "./promotionRules.types";

@injectable()
export class RetailPromotionRulesService extends BaseService<RetailPromotionRules> {
  constructor(@inject(RETAIL_PROMOTION_RULES_TYPES.Repository) repository: RetailPromotionRulesRepository) {
    super(repository);
  }
}
