export const RETAIL_PAYMENT_METHODS_TYPES = {
  Repository: Symbol.for("RetailPaymentMethodsRepository"),
  Service: Symbol.for("RetailPaymentMethodsService"),
  Controller: Symbol.for("RetailPaymentMethodsController"),
  Router: Symbol.for("RetailPaymentMethodsRouter"),
} as const;

export const PAYMENTMETHODS_RESOURCE = "payment-methods" as const;
