export const RETAIL_FULFILLMENT_ITEMS_TYPES = {
  Repository: Symbol.for("RetailFulfillmentItemsRepository"),
  Service: Symbol.for("RetailFulfillmentItemsService"),
  Controller: Symbol.for("RetailFulfillmentItemsController"),
  Router: Symbol.for("RetailFulfillmentItemsRouter"),
} as const;

export const FULFILLMENTITEMS_RESOURCE = "fulfillment-items" as const;
