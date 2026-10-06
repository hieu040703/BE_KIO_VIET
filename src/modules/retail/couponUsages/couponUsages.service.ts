import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCouponUsages } from "@/database/models/retail/RetailGenericEntities";
import { RetailCouponUsagesRepository } from "./couponUsages.repository";
import { RETAIL_COUPON_USAGES_TYPES } from "./couponUsages.types";

@injectable()
export class RetailCouponUsagesService extends BaseService<RetailCouponUsages> {
  constructor(@inject(RETAIL_COUPON_USAGES_TYPES.Repository) repository: RetailCouponUsagesRepository) {
    super(repository);
  }
}
