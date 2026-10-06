import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailStockTransfers } from "@/database/models/retail/RetailGenericEntities";
import { RetailStockTransfersRepository } from "./stockTransfers.repository";
import { RETAIL_STOCK_TRANSFERS_TYPES } from "./stockTransfers.types";

@injectable()
export class RetailStockTransfersService extends BaseService<RetailStockTransfers> {
  constructor(@inject(RETAIL_STOCK_TRANSFERS_TYPES.Repository) repository: RetailStockTransfersRepository) {
    super(repository);
  }
}
