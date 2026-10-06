import { injectable, inject } from "inversify";
import { RetailStockCountItemsService } from "./stockCountItems.service";
import { RETAIL_STOCK_COUNT_ITEMS_TYPES } from "./stockCountItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailStockCountItemsController extends BaseController<RetailStockCountItemsService> {
  constructor(@inject(RETAIL_STOCK_COUNT_ITEMS_TYPES.Service) protected service: RetailStockCountItemsService) {
    super(service);
  }
}
