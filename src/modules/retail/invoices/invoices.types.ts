export const RETAIL_INVOICES_TYPES = {
  Repository: Symbol.for("RetailInvoicesRepository"),
  Service: Symbol.for("RetailInvoicesService"),
  Controller: Symbol.for("RetailInvoicesController"),
  Router: Symbol.for("RetailInvoicesRouter"),
} as const;

export const INVOICES_RESOURCE = "invoices" as const;
