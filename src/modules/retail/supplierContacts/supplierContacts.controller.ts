import { injectable, inject } from "inversify";
import { RetailSupplierContactsService } from "./supplierContacts.service";
import { RETAIL_SUPPLIER_CONTACTS_TYPES } from "./supplierContacts.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailSupplierContactsController extends BaseController<RetailSupplierContactsService> {
  constructor(@inject(RETAIL_SUPPLIER_CONTACTS_TYPES.Service) protected service: RetailSupplierContactsService) {
    super(service);
  }
}
