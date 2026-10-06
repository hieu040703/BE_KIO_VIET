import { injectable, inject } from "inversify";
import { RetailInvoicesService } from "./invoices.service";
import { RETAIL_INVOICES_TYPES } from "./invoices.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailInvoicesController extends BaseController<RetailInvoicesService> {
  constructor(@inject(RETAIL_INVOICES_TYPES.Service) protected service: RetailInvoicesService) {
    super(service);
  }
}
