export const RETAIL_PERMISSIONS_TYPES = {
  Repository: Symbol.for("RetailPermissionsRepository"),
  Service: Symbol.for("RetailPermissionsService"),
  Controller: Symbol.for("RetailPermissionsController"),
  Router: Symbol.for("RetailPermissionsRouter"),
} as const;

export const PERMISSIONS_RESOURCE = "permissions" as const;
