import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailFinancialAccounts } from "@/database/models/retail/RetailGenericEntities";
import { RetailFinancialAccountsRepository } from "./financialAccounts.repository";
import { RETAIL_FINANCIAL_ACCOUNTS_TYPES } from "./financialAccounts.types";

@injectable()
export class RetailFinancialAccountsService extends BaseService<RetailFinancialAccounts> {
  constructor(@inject(RETAIL_FINANCIAL_ACCOUNTS_TYPES.Repository) repository: RetailFinancialAccountsRepository) {
    super(repository);
  }
}
