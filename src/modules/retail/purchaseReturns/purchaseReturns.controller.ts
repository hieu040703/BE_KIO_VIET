import { injectable, inject } from "inversify";
import { RetailPurchaseReturnsService } from "./purchaseReturns.service";
import { RETAIL_PURCHASE_RETURNS_TYPES } from "./purchaseReturns.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailPurchaseReturnsController extends BaseController<RetailPurchaseReturnsService> {
  constructor(@inject(RETAIL_PURCHASE_RETURNS_TYPES.Service) protected service: RetailPurchaseReturnsService) {
    super(service);
  }
}
