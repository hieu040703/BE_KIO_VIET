import { injectable } from "inversify";
import { RetailPaymentTransactions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { PAYMENTTRANSACTIONS_RESOURCE } from "./paymentTransactions.types";

@injectable()
export class RetailPaymentTransactionsRepository extends BaseRepository<RetailPaymentTransactions> {
  protected entityClass = RetailPaymentTransactions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[PAYMENTTRANSACTIONS_RESOURCE];
  }
}
