export const RETAIL_ATTRIBUTE_VALUES_TYPES = {
  Repository: Symbol.for("RetailAttributeValuesRepository"),
  Service: Symbol.for("RetailAttributeValuesService"),
  Controller: Symbol.for("RetailAttributeValuesController"),
  Router: Symbol.for("RetailAttributeValuesRouter"),
} as const;

export const ATTRIBUTEVALUES_RESOURCE = "attribute-values" as const;
