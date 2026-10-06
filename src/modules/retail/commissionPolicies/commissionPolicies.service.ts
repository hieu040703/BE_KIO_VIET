import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCommissionPolicies } from "@/database/models/retail/RetailGenericEntities";
import { RetailCommissionPoliciesRepository } from "./commissionPolicies.repository";
import { RETAIL_COMMISSION_POLICIES_TYPES } from "./commissionPolicies.types";

@injectable()
export class RetailCommissionPoliciesService extends BaseService<RetailCommissionPolicies> {
  constructor(@inject(RETAIL_COMMISSION_POLICIES_TYPES.Repository) repository: RetailCommissionPoliciesRepository) {
    super(repository);
  }
}
