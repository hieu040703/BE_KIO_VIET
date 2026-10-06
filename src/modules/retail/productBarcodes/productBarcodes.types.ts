export const RETAIL_PRODUCT_BARCODES_TYPES = {
  Repository: Symbol.for("RetailProductBarcodesRepository"),
  Service: Symbol.for("RetailProductBarcodesService"),
  Controller: Symbol.for("RetailProductBarcodesController"),
  Router: Symbol.for("RetailProductBarcodesRouter"),
} as const;

export const PRODUCTBARCODES_RESOURCE = "product-barcodes" as const;
