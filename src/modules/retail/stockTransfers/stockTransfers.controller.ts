import { injectable, inject } from "inversify";
import { RetailStockTransfersService } from "./stockTransfers.service";
import { RETAIL_STOCK_TRANSFERS_TYPES } from "./stockTransfers.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailStockTransfersController extends BaseController<RetailStockTransfersService> {
  constructor(@inject(RETAIL_STOCK_TRANSFERS_TYPES.Service) protected service: RetailStockTransfersService) {
    super(service);
  }
}
