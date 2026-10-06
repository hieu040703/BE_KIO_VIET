import { injectable } from "inversify";
import { RetailSupplierDebtTransactions } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { SUPPLIERDEBTTRANSACTIONS_RESOURCE } from "./supplierDebtTransactions.types";

@injectable()
export class RetailSupplierDebtTransactionsRepository extends BaseRepository<RetailSupplierDebtTransactions> {
  protected entityClass = RetailSupplierDebtTransactions;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[SUPPLIERDEBTTRANSACTIONS_RESOURCE];
  }
}
