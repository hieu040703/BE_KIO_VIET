import { injectable, inject } from "inversify";
import { RetailInvoiceItemsService } from "./invoiceItems.service";
import { RETAIL_INVOICE_ITEMS_TYPES } from "./invoiceItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailInvoiceItemsController extends BaseController<RetailInvoiceItemsService> {
  constructor(@inject(RETAIL_INVOICE_ITEMS_TYPES.Service) protected service: RetailInvoiceItemsService) {
    super(service);
  }
}
