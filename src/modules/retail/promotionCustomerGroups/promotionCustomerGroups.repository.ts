import { injectable } from "inversify";
import { RetailPromotionCustomerGroups } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PROMOTIONCUSTOMERGROUPS_RESOURCE } from "./promotionCustomerGroups.types";

@injectable()
export class RetailPromotionCustomerGroupsRepository extends BaseRepository<RetailPromotionCustomerGroups> {
  protected entityClass = RetailPromotionCustomerGroups;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PROMOTIONCUSTOMERGROUPS_RESOURCE];
  }
}
