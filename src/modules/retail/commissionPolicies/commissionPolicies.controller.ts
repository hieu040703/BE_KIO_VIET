import { injectable, inject } from "inversify";
import { RetailCommissionPoliciesService } from "./commissionPolicies.service";
import { RETAIL_COMMISSION_POLICIES_TYPES } from "./commissionPolicies.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCommissionPoliciesController extends BaseController<RetailCommissionPoliciesService> {
  constructor(@inject(RETAIL_COMMISSION_POLICIES_TYPES.Service) protected service: RetailCommissionPoliciesService) {
    super(service);
  }
}
