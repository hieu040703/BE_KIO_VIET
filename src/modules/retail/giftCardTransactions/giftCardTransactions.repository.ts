import { injectable } from "inversify";
import { RetailGiftCardTransactions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { GIFTCARDTRANSACTIONS_RESOURCE } from "./giftCardTransactions.types";

@injectable()
export class RetailGiftCardTransactionsRepository extends BaseRepository<RetailGiftCardTransactions> {
  protected entityClass = RetailGiftCardTransactions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[GIFTCARDTRANSACTIONS_RESOURCE];
  }
}
