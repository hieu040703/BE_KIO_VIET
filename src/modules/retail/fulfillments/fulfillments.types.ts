export const RETAIL_FULFILLMENTS_TYPES = {
  Repository: Symbol.for("RetailFulfillmentsRepository"),
  Service: Symbol.for("RetailFulfillmentsService"),
  Controller: Symbol.for("RetailFulfillmentsController"),
  Router: Symbol.for("RetailFulfillmentsRouter"),
} as const;

export const FULFILLMENTS_RESOURCE = "fulfillments" as const;
