export const RETAIL_COMMISSION_POLICIES_TYPES = {
  Repository: Symbol.for("RetailCommissionPoliciesRepository"),
  Service: Symbol.for("RetailCommissionPoliciesService"),
  Controller: Symbol.for("RetailCommissionPoliciesController"),
  Router: Symbol.for("RetailCommissionPoliciesRouter"),
} as const;

export const COMMISSIONPOLICIES_RESOURCE = "commission-policies" as const;
