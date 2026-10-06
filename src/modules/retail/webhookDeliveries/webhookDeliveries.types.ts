export const RETAIL_WEBHOOK_DELIVERIES_TYPES = {
  Repository: Symbol.for("RetailWebhookDeliveriesRepository"),
  Service: Symbol.for("RetailWebhookDeliveriesService"),
  Controller: Symbol.for("RetailWebhookDeliveriesController"),
  Router: Symbol.for("RetailWebhookDeliveriesRouter"),
} as const;

export const WEBHOOKDELIVERIES_RESOURCE = "webhook-deliveries" as const;
