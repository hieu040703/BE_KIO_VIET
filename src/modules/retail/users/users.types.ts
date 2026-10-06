export const RETAIL_USERS_TYPES = {
  Repository: Symbol.for("RetailUsersRepository"),
  Service: Symbol.for("RetailUsersService"),
  Controller: Symbol.for("RetailUsersController"),
  Router: Symbol.for("RetailUsersRouter"),
} as const;

export const USERS_RESOURCE = "users" as const;
