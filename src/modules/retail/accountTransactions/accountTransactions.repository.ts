import { injectable } from "inversify";
import { RetailAccountTransactions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { ACCOUNTTRANSACTIONS_RESOURCE } from "./accountTransactions.types";

@injectable()
export class RetailAccountTransactionsRepository extends BaseRepository<RetailAccountTransactions> {
  protected entityClass = RetailAccountTransactions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[ACCOUNTTRANSACTIONS_RESOURCE];
  }
}
