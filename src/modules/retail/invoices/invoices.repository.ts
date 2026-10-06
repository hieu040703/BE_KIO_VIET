import { injectable } from "inversify";
import { RetailInvoices } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { INVOICES_RESOURCE } from "./invoices.types";

@injectable()
export class RetailInvoicesRepository extends BaseRepository<RetailInvoices> {
  protected entityClass = RetailInvoices;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[INVOICES_RESOURCE];
  }
}
