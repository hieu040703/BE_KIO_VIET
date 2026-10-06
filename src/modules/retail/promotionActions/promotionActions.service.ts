import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPromotionActions } from "@/database/models/retail/RetailGenericEntities";
import { RetailPromotionActionsRepository } from "./promotionActions.repository";
import { RETAIL_PROMOTION_ACTIONS_TYPES } from "./promotionActions.types";

@injectable()
export class RetailPromotionActionsService extends BaseService<RetailPromotionActions> {
  constructor(@inject(RETAIL_PROMOTION_ACTIONS_TYPES.Repository) repository: RetailPromotionActionsRepository) {
    super(repository);
  }
}
