import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailStockAdjustments } from "@/database/models/retail/RetailGenericEntities";
import { RetailStockAdjustmentsRepository } from "./stockAdjustments.repository";
import { RETAIL_STOCK_ADJUSTMENTS_TYPES } from "./stockAdjustments.types";

@injectable()
export class RetailStockAdjustmentsService extends BaseService<RetailStockAdjustments> {
  constructor(@inject(RETAIL_STOCK_ADJUSTMENTS_TYPES.Repository) repository: RetailStockAdjustmentsRepository) {
    super(repository);
  }
}
