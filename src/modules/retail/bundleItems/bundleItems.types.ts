export const RETAIL_BUNDLE_ITEMS_TYPES = {
  Repository: Symbol.for("RetailBundleItemsRepository"),
  Service: Symbol.for("RetailBundleItemsService"),
  Controller: Symbol.for("RetailBundleItemsController"),
  Router: Symbol.for("RetailBundleItemsRouter"),
} as const;

export const BUNDLEITEMS_RESOURCE = "bundle-items" as const;
