import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailStockCounts } from "@/database/models/retail/RetailGenericEntities";
import { RetailStockCountsRepository } from "./stockCounts.repository";
import { RETAIL_STOCK_COUNTS_TYPES } from "./stockCounts.types";

@injectable()
export class RetailStockCountsService extends BaseService<RetailStockCounts> {
  constructor(@inject(RETAIL_STOCK_COUNTS_TYPES.Repository) repository: RetailStockCountsRepository) {
    super(repository);
  }
}
