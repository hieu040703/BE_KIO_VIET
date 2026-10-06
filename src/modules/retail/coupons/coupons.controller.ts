import { injectable, inject } from "inversify";
import { RetailCouponsService } from "./coupons.service";
import { RETAIL_COUPONS_TYPES } from "./coupons.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCouponsController extends BaseController<RetailCouponsService> {
  constructor(@inject(RETAIL_COUPONS_TYPES.Service) protected service: RetailCouponsService) {
    super(service);
  }
}
