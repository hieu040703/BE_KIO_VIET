import { injectable, inject } from "inversify";
import { RetailPromotionProductsService } from "./promotionProducts.service";
import { RETAIL_PROMOTION_PRODUCTS_TYPES } from "./promotionProducts.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPromotionProductsController extends BaseController<RetailPromotionProductsService> {
  constructor(@inject(RETAIL_PROMOTION_PRODUCTS_TYPES.Service) protected service: RetailPromotionProductsService) {
    super(service);
  }
}
