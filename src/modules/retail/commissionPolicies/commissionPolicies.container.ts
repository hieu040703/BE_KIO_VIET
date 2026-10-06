import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { RetailCommissionPoliciesController } from "./commissionPolicies.controller";
import { RetailCommissionPoliciesRepository } from "./commissionPolicies.repository";
import { RetailCommissionPoliciesRouter } from "./commissionPolicies.route";
import { RetailCommissionPoliciesService } from "./commissionPolicies.service";
import { RETAIL_COMMISSION_POLICIES_TYPES } from "./commissionPolicies.types";

export const commissionPoliciesModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<RetailCommissionPoliciesRepository>(RETAIL_COMMISSION_POLICIES_TYPES.Repository).to(RetailCommissionPoliciesRepository);
  options.bind<RetailCommissionPoliciesService>(RETAIL_COMMISSION_POLICIES_TYPES.Service).to(RetailCommissionPoliciesService);
  options.bind<RetailCommissionPoliciesController>(RETAIL_COMMISSION_POLICIES_TYPES.Controller).to(RetailCommissionPoliciesController);
  options.bind<RetailCommissionPoliciesRouter>(RETAIL_COMMISSION_POLICIES_TYPES.Router).to(RetailCommissionPoliciesRouter);
});
