export const RETAIL_USER_SESSIONS_TYPES = {
  Repository: Symbol.for("RetailUserSessionsRepository"),
  Service: Symbol.for("RetailUserSessionsService"),
  Controller: Symbol.for("RetailUserSessionsController"),
  Router: Symbol.for("RetailUserSessionsRouter"),
} as const;

export const USERSESSIONS_RESOURCE = "user-sessions" as const;
