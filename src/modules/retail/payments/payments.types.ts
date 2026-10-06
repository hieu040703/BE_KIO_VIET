export const RETAIL_PAYMENTS_TYPES = {
  Repository: Symbol.for("RetailPaymentsRepository"),
  Service: Symbol.for("RetailPaymentsService"),
  Controller: Symbol.for("RetailPaymentsController"),
  Router: Symbol.for("RetailPaymentsRouter"),
} as const;

export const PAYMENTS_RESOURCE = "payments" as const;
