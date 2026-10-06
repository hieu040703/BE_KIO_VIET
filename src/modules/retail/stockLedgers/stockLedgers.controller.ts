import { injectable, inject } from "inversify";
import { RetailStockLedgersService } from "./stockLedgers.service";
import { RETAIL_STOCK_LEDGERS_TYPES } from "./stockLedgers.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailStockLedgersController extends BaseController<RetailStockLedgersService> {
  constructor(@inject(RETAIL_STOCK_LEDGERS_TYPES.Service) protected service: RetailStockLedgersService) {
    super(service);
  }
}
