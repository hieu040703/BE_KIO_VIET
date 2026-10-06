export const RETAIL_SALES_CHANNELS_TYPES = {
  Repository: Symbol.for("RetailSalesChannelsRepository"),
  Service: Symbol.for("RetailSalesChannelsService"),
  Controller: Symbol.for("RetailSalesChannelsController"),
  Router: Symbol.for("RetailSalesChannelsRouter"),
} as const;

export const SALESCHANNELS_RESOURCE = "sales-channels" as const;
