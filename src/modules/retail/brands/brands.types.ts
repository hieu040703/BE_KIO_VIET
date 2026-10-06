export const RETAIL_BRANDS_TYPES = {
  Repository: Symbol.for("RetailBrandsRepository"),
  Service: Symbol.for("RetailBrandsService"),
  Controller: Symbol.for("RetailBrandsController"),
  Router: Symbol.for("RetailBrandsRouter"),
} as const;

export const BRANDS_RESOURCE = "brands" as const;
