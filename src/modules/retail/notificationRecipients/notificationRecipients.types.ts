export const RETAIL_NOTIFICATION_RECIPIENTS_TYPES = {
  Repository: Symbol.for("RetailNotificationRecipientsRepository"),
  Service: Symbol.for("RetailNotificationRecipientsService"),
  Controller: Symbol.for("RetailNotificationRecipientsController"),
  Router: Symbol.for("RetailNotificationRecipientsRouter"),
} as const;

export const NOTIFICATIONRECIPIENTS_RESOURCE = "notification-recipients" as const;
