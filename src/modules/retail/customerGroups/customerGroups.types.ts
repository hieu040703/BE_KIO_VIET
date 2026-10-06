export const RETAIL_CUSTOMER_GROUPS_TYPES = {
  Repository: Symbol.for("RetailCustomerGroupsRepository"),
  Service: Symbol.for("RetailCustomerGroupsService"),
  Controller: Symbol.for("RetailCustomerGroupsController"),
  Router: Symbol.for("RetailCustomerGroupsRouter"),
} as const;

export const CUSTOMERGROUPS_RESOURCE = "customer-groups" as const;
