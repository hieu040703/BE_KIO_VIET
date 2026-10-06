import { injectable, inject } from "inversify";
import { RetailOrderItemsService } from "./orderItems.service";
import { RETAIL_ORDER_ITEMS_TYPES } from "./orderItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailOrderItemsController extends BaseController<RetailOrderItemsService> {
  constructor(@inject(RETAIL_ORDER_ITEMS_TYPES.Service) protected service: RetailOrderItemsService) {
    super(service);
  }
}
