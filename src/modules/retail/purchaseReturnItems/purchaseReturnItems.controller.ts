import { injectable, inject } from "inversify";
import { RetailPurchaseReturnItemsService } from "./purchaseReturnItems.service";
import { RETAIL_PURCHASE_RETURN_ITEMS_TYPES } from "./purchaseReturnItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPurchaseReturnItemsController extends BaseController<RetailPurchaseReturnItemsService> {
  constructor(@inject(RETAIL_PURCHASE_RETURN_ITEMS_TYPES.Service) protected service: RetailPurchaseReturnItemsService) {
    super(service);
  }
}
