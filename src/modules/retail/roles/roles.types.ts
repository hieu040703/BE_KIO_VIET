export const RETAIL_ROLES_TYPES = {
  Repository: Symbol.for("RetailRolesRepository"),
  Service: Symbol.for("RetailRolesService"),
  Controller: Symbol.for("RetailRolesController"),
  Router: Symbol.for("RetailRolesRouter"),
} as const;

export const ROLES_RESOURCE = "roles" as const;
