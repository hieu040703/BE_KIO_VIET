export const RETAIL_WEBHOOKS_TYPES = {
  Repository: Symbol.for("RetailWebhooksRepository"),
  Service: Symbol.for("RetailWebhooksService"),
  Controller: Symbol.for("RetailWebhooksController"),
  Router: Symbol.for("RetailWebhooksRouter"),
} as const;

export const WEBHOOKS_RESOURCE = "webhooks" as const;
