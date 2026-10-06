import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailSupplierContacts } from "@/database/models/retail/RetailGenericEntities";
import { RetailSupplierContactsRepository } from "./supplierContacts.repository";
import { RETAIL_SUPPLIER_CONTACTS_TYPES } from "./supplierContacts.types";

@injectable()
export class RetailSupplierContactsService extends BaseService<RetailSupplierContacts> {
  constructor(@inject(RETAIL_SUPPLIER_CONTACTS_TYPES.Repository) repository: RetailSupplierContactsRepository) {
    super(repository);
  }
}
