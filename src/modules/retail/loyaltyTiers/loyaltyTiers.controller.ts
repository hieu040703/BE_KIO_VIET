import { injectable, inject } from "inversify";
import { RetailLoyaltyTiersService } from "./loyaltyTiers.service";
import { RETAIL_LOYALTY_TIERS_TYPES } from "./loyaltyTiers.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailLoyaltyTiersController extends BaseController<RetailLoyaltyTiersService> {
  constructor(@inject(RETAIL_LOYALTY_TIERS_TYPES.Service) protected service: RetailLoyaltyTiersService) {
    super(service);
  }
}
