import { injectable } from "inversify";
import { RetailVoucherTransactions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { VOUCHERTRANSACTIONS_RESOURCE } from "./voucherTransactions.types";

@injectable()
export class RetailVoucherTransactionsRepository extends BaseRepository<RetailVoucherTransactions> {
  protected entityClass = RetailVoucherTransactions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[VOUCHERTRANSACTIONS_RESOURCE];
  }
}
