export const RETAIL_SHIPMENTS_TYPES = {
  Repository: Symbol.for("RetailShipmentsRepository"),
  Service: Symbol.for("RetailShipmentsService"),
  Controller: Symbol.for("RetailShipmentsController"),
  Router: Symbol.for("RetailShipmentsRouter"),
} as const;

export const SHIPMENTS_RESOURCE = "shipments" as const;
