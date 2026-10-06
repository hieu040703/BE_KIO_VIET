import { injectable } from "inversify";
import { RetailCustomerDebtTransactions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CUSTOMERDEBTTRANSACTIONS_RESOURCE } from "./customerDebtTransactions.types";

@injectable()
export class RetailCustomerDebtTransactionsRepository extends BaseRepository<RetailCustomerDebtTransactions> {
  protected entityClass = RetailCustomerDebtTransactions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CUSTOMERDEBTTRANSACTIONS_RESOURCE];
  }
}
