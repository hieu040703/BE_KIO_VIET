export const RETAIL_PENALTIES_TYPES = {
  Repository: Symbol.for("RetailPenaltiesRepository"),
  Service: Symbol.for("RetailPenaltiesService"),
  Controller: Symbol.for("RetailPenaltiesController"),
  Router: Symbol.for("RetailPenaltiesRouter"),
} as const;

export const PENALTIES_RESOURCE = "penalties" as const;
