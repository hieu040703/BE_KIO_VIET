export const RETAIL_SYSTEM_SETTINGS_TYPES = {
  Repository: Symbol.for("RetailSystemSettingsRepository"),
  Service: Symbol.for("RetailSystemSettingsService"),
  Controller: Symbol.for("RetailSystemSettingsController"),
  Router: Symbol.for("RetailSystemSettingsRouter"),
} as const;

export const SYSTEMSETTINGS_RESOURCE = "system-settings" as const;
