import { injectable, inject } from "inversify";
import { RetailStockAdjustmentsService } from "./stockAdjustments.service";
import { RETAIL_STOCK_ADJUSTMENTS_TYPES } from "./stockAdjustments.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailStockAdjustmentsController extends BaseController<RetailStockAdjustmentsService> {
  constructor(@inject(RETAIL_STOCK_ADJUSTMENTS_TYPES.Service) protected service: RetailStockAdjustmentsService) {
    super(service);
  }
}
