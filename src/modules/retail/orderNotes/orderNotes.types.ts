export const RETAIL_ORDER_NOTES_TYPES = {
  Repository: Symbol.for("RetailOrderNotesRepository"),
  Service: Symbol.for("RetailOrderNotesService"),
  Controller: Symbol.for("RetailOrderNotesController"),
  Router: Symbol.for("RetailOrderNotesRouter"),
} as const;

export const ORDERNOTES_RESOURCE = "order-notes" as const;
