import { injectable, inject } from "inversify";
import { RetailStockTransferItemsService } from "./stockTransferItems.service";
import { RETAIL_STOCK_TRANSFER_ITEMS_TYPES } from "./stockTransferItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailStockTransferItemsController extends BaseController<RetailStockTransferItemsService> {
  constructor(@inject(RETAIL_STOCK_TRANSFER_ITEMS_TYPES.Service) protected service: RetailStockTransferItemsService) {
    super(service);
  }
}
