export const RETAIL_CATEGORIES_TYPES = {
  Repository: Symbol.for("RetailCategoriesRepository"),
  Service: Symbol.for("RetailCategoriesService"),
  Controller: Symbol.for("RetailCategoriesController"),
  Router: Symbol.for("RetailCategoriesRouter"),
} as const;

export const CATEGORIES_RESOURCE = "categories" as const;
