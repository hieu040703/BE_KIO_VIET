export const RETAIL_CUSTOMER_TAGS_TYPES = {
  Repository: Symbol.for("RetailCustomerTagsRepository"),
  Service: Symbol.for("RetailCustomerTagsService"),
  Controller: Symbol.for("RetailCustomerTagsController"),
  Router: Symbol.for("RetailCustomerTagsRouter"),
} as const;

export const CUSTOMERTAGS_RESOURCE = "customer-tags" as const;
