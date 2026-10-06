import { injectable } from "inversify";
import { RetailFinancialAccounts } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { FINANCIALACCOUNTS_RESOURCE } from "./financialAccounts.types";

@injectable()
export class RetailFinancialAccountsRepository extends BaseRepository<RetailFinancialAccounts> {
  protected entityClass = RetailFinancialAccounts;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[FINANCIALACCOUNTS_RESOURCE];
  }
}
