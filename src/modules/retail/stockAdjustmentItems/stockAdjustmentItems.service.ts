import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailStockAdjustmentItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailStockAdjustmentItemsRepository } from "./stockAdjustmentItems.repository";
import { RETAIL_STOCK_ADJUSTMENT_ITEMS_TYPES } from "./stockAdjustmentItems.types";

@injectable()
export class RetailStockAdjustmentItemsService extends BaseService<RetailStockAdjustmentItems> {
  constructor(@inject(RETAIL_STOCK_ADJUSTMENT_ITEMS_TYPES.Repository) repository: RetailStockAdjustmentItemsRepository) {
    super(repository);
  }
}
