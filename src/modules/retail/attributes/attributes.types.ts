export const RETAIL_ATTRIBUTES_TYPES = {
  Repository: Symbol.for("RetailAttributesRepository"),
  Service: Symbol.for("RetailAttributesService"),
  Controller: Symbol.for("RetailAttributesController"),
  Router: Symbol.for("RetailAttributesRouter"),
} as const;

export const ATTRIBUTES_RESOURCE = "attributes" as const;
