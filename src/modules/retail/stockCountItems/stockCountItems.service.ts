import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailStockCountItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailStockCountItemsRepository } from "./stockCountItems.repository";
import { RETAIL_STOCK_COUNT_ITEMS_TYPES } from "./stockCountItems.types";

@injectable()
export class RetailStockCountItemsService extends BaseService<RetailStockCountItems> {
  constructor(@inject(RETAIL_STOCK_COUNT_ITEMS_TYPES.Repository) repository: RetailStockCountItemsRepository) {
    super(repository);
  }
}
