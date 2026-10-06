export const RETAIL_POSITIONS_TYPES = {
  Repository: Symbol.for("RetailPositionsRepository"),
  Service: Symbol.for("RetailPositionsService"),
  Controller: Symbol.for("RetailPositionsController"),
  Router: Symbol.for("RetailPositionsRouter"),
} as const;

export const POSITIONS_RESOURCE = "positions" as const;
