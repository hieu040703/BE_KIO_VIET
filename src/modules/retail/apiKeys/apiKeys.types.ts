export const RETAIL_API_KEYS_TYPES = {
  Repository: Symbol.for("RetailApiKeysRepository"),
  Service: Symbol.for("RetailApiKeysService"),
  Controller: Symbol.for("RetailApiKeysController"),
  Router: Symbol.for("RetailApiKeysRouter"),
} as const;

export const APIKEYS_RESOURCE = "api-keys" as const;
