export const RETAIL_CUSTOMER_CONTACTS_TYPES = {
  Repository: Symbol.for("RetailCustomerContactsRepository"),
  Service: Symbol.for("RetailCustomerContactsService"),
  Controller: Symbol.for("RetailCustomerContactsController"),
  Router: Symbol.for("RetailCustomerContactsRouter"),
} as const;

export const CUSTOMERCONTACTS_RESOURCE = "customer-contacts" as const;
