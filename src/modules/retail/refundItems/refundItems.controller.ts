import { injectable, inject } from "inversify";
import { RetailRefundItemsService } from "./refundItems.service";
import { RETAIL_REFUND_ITEMS_TYPES } from "./refundItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailRefundItemsController extends BaseController<RetailRefundItemsService> {
  constructor(@inject(RETAIL_REFUND_ITEMS_TYPES.Service) protected service: RetailRefundItemsService) {
    super(service);
  }
}
