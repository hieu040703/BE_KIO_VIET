export const RETAIL_BUNDLES_TYPES = {
  Repository: Symbol.for("RetailBundlesRepository"),
  Service: Symbol.for("RetailBundlesService"),
  Controller: Symbol.for("RetailBundlesController"),
  Router: Symbol.for("RetailBundlesRouter"),
} as const;

export const BUNDLES_RESOURCE = "bundles" as const;
