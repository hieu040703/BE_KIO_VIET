export const RETAIL_CUSTOMER_ADDRESSES_TYPES = {
  Repository: Symbol.for("RetailCustomerAddressesRepository"),
  Service: Symbol.for("RetailCustomerAddressesService"),
  Controller: Symbol.for("RetailCustomerAddressesController"),
  Router: Symbol.for("RetailCustomerAddressesRouter"),
} as const;

export const CUSTOMERADDRESSES_RESOURCE = "customer-addresses" as const;
