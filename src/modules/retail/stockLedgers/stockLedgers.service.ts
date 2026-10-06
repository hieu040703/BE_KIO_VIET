import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailStockLedger } from "@/database/models";
import { RetailStockLedgersRepository } from "./stockLedgers.repository";
import { RETAIL_STOCK_LEDGERS_TYPES } from "./stockLedgers.types";

@injectable()
export class RetailStockLedgersService extends BaseService<RetailStockLedger> {
  constructor(@inject(RETAIL_STOCK_LEDGERS_TYPES.Repository) repository: RetailStockLedgersRepository) {
    super(repository);
  }
}
