import { injectable, inject } from "inversify";
import { RetailShippingOrdersService } from "./shippingOrders.service";
import { RETAIL_SHIPPING_ORDERS_TYPES } from "./shippingOrders.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailShippingOrdersController extends BaseController<RetailShippingOrdersService> {
  constructor(@inject(RETAIL_SHIPPING_ORDERS_TYPES.Service) protected service: RetailShippingOrdersService) {
    super(service);
  }
}
