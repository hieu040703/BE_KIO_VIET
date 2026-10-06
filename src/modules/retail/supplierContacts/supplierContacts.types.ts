export const RETAIL_SUPPLIER_CONTACTS_TYPES = {
  Repository: Symbol.for("RetailSupplierContactsRepository"),
  Service: Symbol.for("RetailSupplierContactsService"),
  Controller: Symbol.for("RetailSupplierContactsController"),
  Router: Symbol.for("RetailSupplierContactsRouter"),
} as const;

export const SUPPLIERCONTACTS_RESOURCE = "supplier-contacts" as const;
