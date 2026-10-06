export const RETAIL_PROMOTION_PRODUCTS_TYPES = {
  Repository: Symbol.for("RetailPromotionProductsRepository"),
  Service: Symbol.for("RetailPromotionProductsService"),
  Controller: Symbol.for("RetailPromotionProductsController"),
  Router: Symbol.for("RetailPromotionProductsRouter"),
} as const;

export const PROMOTIONPRODUCTS_RESOURCE = "promotion-products" as const;
