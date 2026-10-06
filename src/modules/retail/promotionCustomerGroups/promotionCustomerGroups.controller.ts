import { injectable, inject } from "inversify";
import { RetailPromotionCustomerGroupsService } from "./promotionCustomerGroups.service";
import { RETAIL_PROMOTION_CUSTOMER_GROUPS_TYPES } from "./promotionCustomerGroups.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPromotionCustomerGroupsController extends BaseController<RetailPromotionCustomerGroupsService> {
  constructor(@inject(RETAIL_PROMOTION_CUSTOMER_GROUPS_TYPES.Service) protected service: RetailPromotionCustomerGroupsService) {
    super(service);
  }
}
