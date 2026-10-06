export const RETAIL_COUPONS_TYPES = {
  Repository: Symbol.for("RetailCouponsRepository"),
  Service: Symbol.for("RetailCouponsService"),
  Controller: Symbol.for("RetailCouponsController"),
  Router: Symbol.for("RetailCouponsRouter"),
} as const;

export const COUPONS_RESOURCE = "coupons" as const;
