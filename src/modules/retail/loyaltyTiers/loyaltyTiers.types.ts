export const RETAIL_LOYALTY_TIERS_TYPES = {
  Repository: Symbol.for("RetailLoyaltyTiersRepository"),
  Service: Symbol.for("RetailLoyaltyTiersService"),
  Controller: Symbol.for("RetailLoyaltyTiersController"),
  Router: Symbol.for("RetailLoyaltyTiersRouter"),
} as const;

export const LOYALTYTIERS_RESOURCE = "loyalty-tiers" as const;
