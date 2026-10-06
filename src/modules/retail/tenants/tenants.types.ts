export const RETAIL_TENANTS_TYPES = {
  Repository: Symbol.for("RetailTenantsRepository"),
  Service: Symbol.for("RetailTenantsService"),
  Controller: Symbol.for("RetailTenantsController"),
  Router: Symbol.for("RetailTenantsRouter"),
} as const;

export const TENANTS_RESOURCE = "tenants" as const;
