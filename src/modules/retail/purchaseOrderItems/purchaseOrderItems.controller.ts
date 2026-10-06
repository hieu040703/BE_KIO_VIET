import { injectable, inject } from "inversify";
import { RetailPurchaseOrderItemsService } from "./purchaseOrderItems.service";
import { RETAIL_PURCHASE_ORDER_ITEMS_TYPES } from "./purchaseOrderItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPurchaseOrderItemsController extends BaseController<RetailPurchaseOrderItemsService> {
  constructor(@inject(RETAIL_PURCHASE_ORDER_ITEMS_TYPES.Service) protected service: RetailPurchaseOrderItemsService) {
    super(service);
  }
}
