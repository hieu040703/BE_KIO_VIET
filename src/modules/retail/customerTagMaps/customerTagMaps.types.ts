export const RETAIL_CUSTOMER_TAG_MAPS_TYPES = {
  Repository: Symbol.for("RetailCustomerTagMapsRepository"),
  Service: Symbol.for("RetailCustomerTagMapsService"),
  Controller: Symbol.for("RetailCustomerTagMapsController"),
  Router: Symbol.for("RetailCustomerTagMapsRouter"),
} as const;

export const CUSTOMERTAGMAPS_RESOURCE = "customer-tag-maps" as const;
