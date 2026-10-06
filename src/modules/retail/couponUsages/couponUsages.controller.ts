import { injectable, inject } from "inversify";
import { RetailCouponUsagesService } from "./couponUsages.service";
import { RETAIL_COUPON_USAGES_TYPES } from "./couponUsages.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCouponUsagesController extends BaseController<RetailCouponUsagesService> {
  constructor(@inject(RETAIL_COUPON_USAGES_TYPES.Service) protected service: RetailCouponUsagesService) {
    super(service);
  }
}
