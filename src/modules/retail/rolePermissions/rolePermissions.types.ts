export const RETAIL_ROLE_PERMISSIONS_TYPES = {
  Repository: Symbol.for("RetailRolePermissionsRepository"),
  Service: Symbol.for("RetailRolePermissionsService"),
  Controller: Symbol.for("RetailRolePermissionsController"),
  Router: Symbol.for("RetailRolePermissionsRouter"),
} as const;

export const ROLEPERMISSIONS_RESOURCE = "role-permissions" as const;
