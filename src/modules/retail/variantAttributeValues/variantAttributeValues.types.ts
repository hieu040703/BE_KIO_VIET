export const RETAIL_VARIANT_ATTRIBUTE_VALUES_TYPES = {
  Repository: Symbol.for("RetailVariantAttributeValuesRepository"),
  Service: Symbol.for("RetailVariantAttributeValuesService"),
  Controller: Symbol.for("RetailVariantAttributeValuesController"),
  Router: Symbol.for("RetailVariantAttributeValuesRouter"),
} as const;

export const VARIANTATTRIBUTEVALUES_RESOURCE = "variant-attribute-values" as const;
