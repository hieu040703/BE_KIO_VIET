export const RETAIL_PROMOTION_CUSTOMER_GROUPS_TYPES = {
  Repository: Symbol.for("RetailPromotionCustomerGroupsRepository"),
  Service: Symbol.for("RetailPromotionCustomerGroupsService"),
  Controller: Symbol.for("RetailPromotionCustomerGroupsController"),
  Router: Symbol.for("RetailPromotionCustomerGroupsRouter"),
} as const;

export const PROMOTIONCUSTOMERGROUPS_RESOURCE = "promotion-customer-groups" as const;
