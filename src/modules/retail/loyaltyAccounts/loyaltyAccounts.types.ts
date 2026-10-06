export const RETAIL_LOYALTY_ACCOUNTS_TYPES = {
  Repository: Symbol.for("RetailLoyaltyAccountsRepository"),
  Service: Symbol.for("RetailLoyaltyAccountsService"),
  Controller: Symbol.for("RetailLoyaltyAccountsController"),
  Router: Symbol.for("RetailLoyaltyAccountsRouter"),
} as const;

export const LOYALTYACCOUNTS_RESOURCE = "loyalty-accounts" as const;
