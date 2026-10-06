import { injectable, inject } from "inversify";
import { RetailOrderStatusHistoryService } from "./orderStatusHistory.service";
import { RETAIL_ORDER_STATUS_HISTORY_TYPES } from "./orderStatusHistory.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailOrderStatusHistoryController extends BaseController<RetailOrderStatusHistoryService> {
  constructor(@inject(RETAIL_ORDER_STATUS_HISTORY_TYPES.Service) protected service: RetailOrderStatusHistoryService) {
    super(service);
  }
}
