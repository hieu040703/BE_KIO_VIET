export const RETAIL_PAYMENT_ALLOCATIONS_TYPES = {
  Repository: Symbol.for("RetailPaymentAllocationsRepository"),
  Service: Symbol.for("RetailPaymentAllocationsService"),
  Controller: Symbol.for("RetailPaymentAllocationsController"),
  Router: Symbol.for("RetailPaymentAllocationsRouter"),
} as const;

export const PAYMENTALLOCATIONS_RESOURCE = "payment-allocations" as const;
