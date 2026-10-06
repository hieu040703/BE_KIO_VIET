import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailInvoiceItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailInvoiceItemsRepository } from "./invoiceItems.repository";
import { RETAIL_INVOICE_ITEMS_TYPES } from "./invoiceItems.types";

@injectable()
export class RetailInvoiceItemsService extends BaseService<RetailInvoiceItems> {
  constructor(@inject(RETAIL_INVOICE_ITEMS_TYPES.Repository) repository: RetailInvoiceItemsRepository) {
    super(repository);
  }
}
