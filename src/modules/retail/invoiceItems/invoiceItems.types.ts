export const RETAIL_INVOICE_ITEMS_TYPES = {
  Repository: Symbol.for("RetailInvoiceItemsRepository"),
  Service: Symbol.for("RetailInvoiceItemsService"),
  Controller: Symbol.for("RetailInvoiceItemsController"),
  Router: Symbol.for("RetailInvoiceItemsRouter"),
} as const;

export const INVOICEITEMS_RESOURCE = "invoice-items" as const;
