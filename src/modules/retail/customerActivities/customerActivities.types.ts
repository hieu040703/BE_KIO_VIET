export const RETAIL_CUSTOMER_ACTIVITIES_TYPES = {
  Repository: Symbol.for("RetailCustomerActivitiesRepository"),
  Service: Symbol.for("RetailCustomerActivitiesService"),
  Controller: Symbol.for("RetailCustomerActivitiesController"),
  Router: Symbol.for("RetailCustomerActivitiesRouter"),
} as const;

export const CUSTOMERACTIVITIES_RESOURCE = "customer-activities" as const;
