export const RETAIL_RECONCILIATIONS_TYPES = {
  Repository: Symbol.for("RetailReconciliationsRepository"),
  Service: Symbol.for("RetailReconciliationsService"),
  Controller: Symbol.for("RetailReconciliationsController"),
  Router: Symbol.for("RetailReconciliationsRouter"),
} as const;

export const RECONCILIATIONS_RESOURCE = "reconciliations" as const;
