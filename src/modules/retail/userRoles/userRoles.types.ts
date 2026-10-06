export const RETAIL_USER_ROLES_TYPES = {
  Repository: Symbol.for("RetailUserRolesRepository"),
  Service: Symbol.for("RetailUserRolesService"),
  Controller: Symbol.for("RetailUserRolesController"),
  Router: Symbol.for("RetailUserRolesRouter"),
} as const;

export const USERROLES_RESOURCE = "user-roles" as const;
