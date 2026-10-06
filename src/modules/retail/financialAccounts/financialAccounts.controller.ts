import { injectable, inject } from "inversify";
import { RetailFinancialAccountsService } from "./financialAccounts.service";
import { RETAIL_FINANCIAL_ACCOUNTS_TYPES } from "./financialAccounts.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailFinancialAccountsController extends BaseController<RetailFinancialAccountsService> {
  constructor(@inject(RETAIL_FINANCIAL_ACCOUNTS_TYPES.Service) protected service: RetailFinancialAccountsService) {
    super(service);
  }
}
