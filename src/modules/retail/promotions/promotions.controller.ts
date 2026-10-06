import { injectable, inject } from "inversify";
import { RetailPromotionsService } from "./promotions.service";
import { RETAIL_PROMOTIONS_TYPES } from "./promotions.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPromotionsController extends BaseController<RetailPromotionsService> {
  constructor(@inject(RETAIL_PROMOTIONS_TYPES.Service) protected service: RetailPromotionsService) {
    super(service);
  }
}
