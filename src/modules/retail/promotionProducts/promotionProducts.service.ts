import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailPromotionProducts } from "@/database/models/retail/RetailGenericEntities";
import { RetailPromotionProductsRepository } from "./promotionProducts.repository";
import { RETAIL_PROMOTION_PRODUCTS_TYPES } from "./promotionProducts.types";

@injectable()
export class RetailPromotionProductsService extends BaseService<RetailPromotionProducts> {
  constructor(@inject(RETAIL_PROMOTION_PRODUCTS_TYPES.Repository) repository: RetailPromotionProductsRepository) {
    super(repository);
  }
}
