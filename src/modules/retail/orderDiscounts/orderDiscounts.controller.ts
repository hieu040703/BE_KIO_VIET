import { injectable, inject } from "inversify";
import { RetailOrderDiscountsService } from "./orderDiscounts.service";
import { RETAIL_ORDER_DISCOUNTS_TYPES } from "./orderDiscounts.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailOrderDiscountsController extends BaseController<RetailOrderDiscountsService> {
  constructor(@inject(RETAIL_ORDER_DISCOUNTS_TYPES.Service) protected service: RetailOrderDiscountsService) {
    super(service);
  }
}
