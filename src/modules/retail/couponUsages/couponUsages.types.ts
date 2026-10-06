export const RETAIL_COUPON_USAGES_TYPES = {
  Repository: Symbol.for("RetailCouponUsagesRepository"),
  Service: Symbol.for("RetailCouponUsagesService"),
  Controller: Symbol.for("RetailCouponUsagesController"),
  Router: Symbol.for("RetailCouponUsagesRouter"),
} as const;

export const COUPONUSAGES_RESOURCE = "coupon-usages" as const;
