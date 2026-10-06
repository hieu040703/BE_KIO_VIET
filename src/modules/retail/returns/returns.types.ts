export const RETAIL_RETURNS_TYPES = {
  Repository: Symbol.for("RetailReturnsRepository"),
  Service: Symbol.for("RetailReturnsService"),
  Controller: Symbol.for("RetailReturnsController"),
  Router: Symbol.for("RetailReturnsRouter"),
} as const;

export const RETURNS_RESOURCE = "returns" as const;
