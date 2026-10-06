export const RETAIL_CUSTOMER_NOTES_TYPES = {
  Repository: Symbol.for("RetailCustomerNotesRepository"),
  Service: Symbol.for("RetailCustomerNotesService"),
  Controller: Symbol.for("RetailCustomerNotesController"),
  Router: Symbol.for("RetailCustomerNotesRouter"),
} as const;

export const CUSTOMERNOTES_RESOURCE = "customer-notes" as const;
