import { injectable, inject } from "inversify";
    import { InvoiceService } from "./invoice.service";
    import { INVOICE_TYPES } from "./invoice.types";
    import { BaseController } from "@/shared/base/BaseController";

    @injectable()
    export class InvoiceController extends BaseController<InvoiceService> {
      constructor(@inject(INVOICE_TYPES.InvoiceService) protected service: InvoiceService) {
        super(service);
      }
    }
    