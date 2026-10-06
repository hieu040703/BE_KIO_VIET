import { injectable, inject } from "inversify";
import { RetailLoyaltyAccountsService } from "./loyaltyAccounts.service";
import { RETAIL_LOYALTY_ACCOUNTS_TYPES } from "./loyaltyAccounts.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailLoyaltyAccountsController extends BaseController<RetailLoyaltyAccountsService> {
  constructor(@inject(RETAIL_LOYALTY_ACCOUNTS_TYPES.Service) protected service: RetailLoyaltyAccountsService) {
    super(service);
  }
}
