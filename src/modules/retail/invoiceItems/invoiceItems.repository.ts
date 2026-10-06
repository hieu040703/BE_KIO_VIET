import { injectable } from "inversify";
import { RetailInvoiceItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { INVOICEITEMS_RESOURCE } from "./invoiceItems.types";

@injectable()
export class RetailInvoiceItemsRepository extends BaseRepository<RetailInvoiceItems> {
  protected entityClass = RetailInvoiceItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[INVOICEITEMS_RESOURCE];
  }
}
