import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailPromotionRulesController } from "./promotionRules.controller";
import { RetailPromotionRulesRepository } from "./promotionRules.repository";
import { RetailPromotionRulesRouter } from "./promotionRules.route";
import { RetailPromotionRulesService } from "./promotionRules.service";
import { RETAIL_PROMOTION_RULES_TYPES } from "./promotionRules.types";

export const promotionRulesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailPromotionRulesRepository>(RETAIL_PROMOTION_RULES_TYPES.Repository).to(RetailPromotionRulesRepository);
  options.bind<RetailPromotionRulesService>(RETAIL_PROMOTION_RULES_TYPES.Service).to(RetailPromotionRulesService);
  options.bind<RetailPromotionRulesController>(RETAIL_PROMOTION_RULES_TYPES.Controller).to(RetailPromotionRulesController);
  options.bind<RetailPromotionRulesRouter>(RETAIL_PROMOTION_RULES_TYPES.Router).to(RetailPromotionRulesRouter);
});
