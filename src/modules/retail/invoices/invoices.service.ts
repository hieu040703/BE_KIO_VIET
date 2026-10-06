import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailInvoices } from "@/database/models/retail/RetailGenericEntities";
import { RetailInvoicesRepository } from "./invoices.repository";
import { RETAIL_INVOICES_TYPES } from "./invoices.types";

@injectable()
export class RetailInvoicesService extends BaseService<RetailInvoices> {
  constructor(@inject(RETAIL_INVOICES_TYPES.Repository) repository: RetailInvoicesRepository) {
    super(repository);
  }
}
