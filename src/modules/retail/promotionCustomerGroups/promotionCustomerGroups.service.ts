import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPromotionCustomerGroups } from "@/database/models/retail/RetailGenericEntities";
import { RetailPromotionCustomerGroupsRepository } from "./promotionCustomerGroups.repository";
import { RETAIL_PROMOTION_CUSTOMER_GROUPS_TYPES } from "./promotionCustomerGroups.types";

@injectable()
export class RetailPromotionCustomerGroupsService extends BaseService<RetailPromotionCustomerGroups> {
  constructor(@inject(RETAIL_PROMOTION_CUSTOMER_GROUPS_TYPES.Repository) repository: RetailPromotionCustomerGroupsRepository) {
    super(repository);
  }
}
