import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPromotions } from "@/database/models/retail/RetailGenericEntities";
import { RetailPromotionsRepository } from "./promotions.repository";
import { RETAIL_PROMOTIONS_TYPES } from "./promotions.types";

@injectable()
export class RetailPromotionsService extends BaseService<RetailPromotions> {
  constructor(@inject(RETAIL_PROMOTIONS_TYPES.Repository) repository: RetailPromotionsRepository) {
    super(repository);
  }
}
