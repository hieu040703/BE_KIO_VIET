export const RETAIL_TAGS_TYPES = {
  Repository: Symbol.for("RetailTagsRepository"),
  Service: Symbol.for("RetailTagsService"),
  Controller: Symbol.for("RetailTagsController"),
  Router: Symbol.for("RetailTagsRouter"),
} as const;

export const TAGS_RESOURCE = "tags" as const;
