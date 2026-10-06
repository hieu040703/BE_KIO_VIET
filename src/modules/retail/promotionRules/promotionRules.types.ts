export const RETAIL_PROMOTION_RULES_TYPES = {
  Repository: Symbol.for("RetailPromotionRulesRepository"),
  Service: Symbol.for("RetailPromotionRulesService"),
  Controller: Symbol.for("RetailPromotionRulesController"),
  Router: Symbol.for("RetailPromotionRulesRouter"),
} as const;

export const PROMOTIONRULES_RESOURCE = "promotion-rules" as const;
