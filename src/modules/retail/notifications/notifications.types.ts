export const RETAIL_NOTIFICATIONS_TYPES = {
  Repository: Symbol.for("RetailNotificationsRepository"),
  Service: Symbol.for("RetailNotificationsService"),
  Controller: Symbol.for("RetailNotificationsController"),
  Router: Symbol.for("RetailNotificationsRouter"),
} as const;

export const NOTIFICATIONS_RESOURCE = "notifications" as const;
