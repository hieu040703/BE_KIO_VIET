import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailStockTransferItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailStockTransferItemsRepository } from "./stockTransferItems.repository";
import { RETAIL_STOCK_TRANSFER_ITEMS_TYPES } from "./stockTransferItems.types";

@injectable()
export class RetailStockTransferItemsService extends BaseService<RetailStockTransferItems> {
  constructor(@inject(RETAIL_STOCK_TRANSFER_ITEMS_TYPES.Repository) repository: RetailStockTransferItemsRepository) {
    super(repository);
  }
}
