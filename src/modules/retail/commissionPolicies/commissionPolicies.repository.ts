import { injectable } from "inversify";
import { RetailCommissionPolicies } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { COMMISSIONPOLICIES_RESOURCE } from "./commissionPolicies.types";

@injectable()
export class RetailCommissionPoliciesRepository extends BaseRepository<RetailCommissionPolicies> {
  protected entityClass = RetailCommissionPolicies;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[COMMISSIONPOLICIES_RESOURCE];
  }
}
