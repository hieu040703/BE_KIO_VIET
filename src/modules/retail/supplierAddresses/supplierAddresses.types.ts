export const RETAIL_SUPPLIER_ADDRESSES_TYPES = {
  Repository: Symbol.for("RetailSupplierAddressesRepository"),
  Service: Symbol.for("RetailSupplierAddressesService"),
  Controller: Symbol.for("RetailSupplierAddressesController"),
  Router: Symbol.for("RetailSupplierAddressesRouter"),
} as const;

export const SUPPLIERADDRESSES_RESOURCE = "supplier-addresses" as const;
