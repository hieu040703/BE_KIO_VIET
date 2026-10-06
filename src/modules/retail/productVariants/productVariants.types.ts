export const RETAIL_PRODUCT_VARIANTS_TYPES = {
  Repository: Symbol.for("RetailProductVariantsRepository"),
  Service: Symbol.for("RetailProductVariantsService"),
  Controller: Symbol.for("RetailProductVariantsController"),
  Router: Symbol.for("RetailProductVariantsRouter"),
} as const;

export const PRODUCTVARIANTS_RESOURCE = "product-variants" as const;
