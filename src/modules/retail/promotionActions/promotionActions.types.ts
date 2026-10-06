export const RETAIL_PROMOTION_ACTIONS_TYPES = {
  Repository: Symbol.for("RetailPromotionActionsRepository"),
  Service: Symbol.for("RetailPromotionActionsService"),
  Controller: Symbol.for("RetailPromotionActionsController"),
  Router: Symbol.for("RetailPromotionActionsRouter"),
} as const;

export const PROMOTIONACTIONS_RESOURCE = "promotion-actions" as const;
