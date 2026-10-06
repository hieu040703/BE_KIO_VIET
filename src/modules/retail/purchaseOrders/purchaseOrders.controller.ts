import { injectable, inject } from "inversify";
import { RetailPurchaseOrdersService } from "./purchaseOrders.service";
import { RETAIL_PURCHASE_ORDERS_TYPES } from "./purchaseOrders.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPurchaseOrdersController extends BaseController<RetailPurchaseOrdersService> {
  constructor(@inject(RETAIL_PURCHASE_ORDERS_TYPES.Service) protected service: RetailPurchaseOrdersService) {
    super(service);
  }
}
