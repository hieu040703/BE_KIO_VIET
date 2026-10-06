import { injectable, inject } from "inversify";
import { RetailPromotionActionsService } from "./promotionActions.service";
import { RETAIL_PROMOTION_ACTIONS_TYPES } from "./promotionActions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPromotionActionsController extends BaseController<RetailPromotionActionsService> {
  constructor(@inject(RETAIL_PROMOTION_ACTIONS_TYPES.Service) protected service: RetailPromotionActionsService) {
    super(service);
  }
}
