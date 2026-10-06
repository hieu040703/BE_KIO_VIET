export const RETAIL_ENTITY_TAGS_TYPES = {
  Repository: Symbol.for("RetailEntityTagsRepository"),
  Service: Symbol.for("RetailEntityTagsService"),
  Controller: Symbol.for("RetailEntityTagsController"),
  Router: Symbol.for("RetailEntityTagsRouter"),
} as const;

export const ENTITYTAGS_RESOURCE = "entity-tags" as const;
