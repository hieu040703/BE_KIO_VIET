import { injectable, inject } from "inversify";
import { RetailPromotionRulesService } from "./promotionRules.service";
import { RETAIL_PROMOTION_RULES_TYPES } from "./promotionRules.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPromotionRulesController extends BaseController<RetailPromotionRulesService> {
  constructor(@inject(RETAIL_PROMOTION_RULES_TYPES.Service) protected service: RetailPromotionRulesService) {
    super(service);
  }
}
