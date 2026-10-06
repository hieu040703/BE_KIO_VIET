import { injectable, inject } from "inversify";
import { RetailStockCountsService } from "./stockCounts.service";
import { RETAIL_STOCK_COUNTS_TYPES } from "./stockCounts.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailStockCountsController extends BaseController<RetailStockCountsService> {
  constructor(@inject(RETAIL_STOCK_COUNTS_TYPES.Service) protected service: RetailStockCountsService) {
    super(service);
  }
}
