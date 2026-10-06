export const RETAIL_SHIPMENT_ITEMS_TYPES = {
  Repository: Symbol.for("RetailShipmentItemsRepository"),
  Service: Symbol.for("RetailShipmentItemsService"),
  Controller: Symbol.for("RetailShipmentItemsController"),
  Router: Symbol.for("RetailShipmentItemsRouter"),
} as const;

export const SHIPMENTITEMS_RESOURCE = "shipment-items" as const;
