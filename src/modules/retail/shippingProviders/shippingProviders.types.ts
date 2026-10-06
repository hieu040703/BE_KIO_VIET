export const RETAIL_SHIPPING_PROVIDERS_TYPES = {
  Repository: Symbol.for("RetailShippingProvidersRepository"),
  Service: Symbol.for("RetailShippingProvidersService"),
  Controller: Symbol.for("RetailShippingProvidersController"),
  Router: Symbol.for("RetailShippingProvidersRouter"),
} as const;

export const SHIPPINGPROVIDERS_RESOURCE = "shipping-providers" as const;
