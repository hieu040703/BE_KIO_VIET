import { injectable, inject } from "inversify";
import { RetailStockAdjustmentItemsService } from "./stockAdjustmentItems.service";
import { RETAIL_STOCK_ADJUSTMENT_ITEMS_TYPES } from "./stockAdjustmentItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailStockAdjustmentItemsController extends BaseController<RetailStockAdjustmentItemsService> {
  constructor(@inject(RETAIL_STOCK_ADJUSTMENT_ITEMS_TYPES.Service) protected service: RetailStockAdjustmentItemsService) {
    super(service);
  }
}
