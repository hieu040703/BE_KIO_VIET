export const RETAIL_TENANT_SETTINGS_TYPES = {
  Repository: Symbol.for("RetailTenantSettingsRepository"),
  Service: Symbol.for("RetailTenantSettingsService"),
  Controller: Symbol.for("RetailTenantSettingsController"),
  Router: Symbol.for("RetailTenantSettingsRouter"),
} as const;

export const TENANTSETTINGS_RESOURCE = "tenant-settings" as const;
