export const RETAIL_CUSTOMER_GROUP_MEMBERS_TYPES = {
  Repository: Symbol.for("RetailCustomerGroupMembersRepository"),
  Service: Symbol.for("RetailCustomerGroupMembersService"),
  Controller: Symbol.for("RetailCustomerGroupMembersController"),
  Router: Symbol.for("RetailCustomerGroupMembersRouter"),
} as const;

export const CUSTOMERGROUPMEMBERS_RESOURCE = "customer-group-members" as const;
