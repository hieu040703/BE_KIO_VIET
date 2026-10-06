import { injectable } from "inversify";
import { RetailSupplierDebts } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { SUPPLIERDEBTS_RESOURCE } from "./supplierDebts.types";

@injectable()
export class RetailSupplierDebtsRepository extends BaseRepository<RetailSupplierDebts> {
  protected entityClass = RetailSupplierDebts;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[SUPPLIERDEBTS_RESOURCE];
  }
}
