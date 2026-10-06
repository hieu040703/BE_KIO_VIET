export const RETAIL_BONUSES_TYPES = {
  Repository: Symbol.for("RetailBonusesRepository"),
  Service: Symbol.for("RetailBonusesService"),
  Controller: Symbol.for("RetailBonusesController"),
  Router: Symbol.for("RetailBonusesRouter"),
} as const;

export const BONUSES_RESOURCE = "bonuses" as const;
