export const RETAIL_PROMOTIONS_TYPES = {
  Repository: Symbol.for("RetailPromotionsRepository"),
  Service: Symbol.for("RetailPromotionsService"),
  Controller: Symbol.for("RetailPromotionsController"),
  Router: Symbol.for("RetailPromotionsRouter"),
} as const;

export const PROMOTIONS_RESOURCE = "promotions" as const;
