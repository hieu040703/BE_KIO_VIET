import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCustomerContacts } from "@/database/models/retail/RetailGenericEntities";
import { RetailCustomerContactsRepository } from "./customerContacts.repository";
import { RETAIL_CUSTOMER_CONTACTS_TYPES } from "./customerContacts.types";

@injectable()
export class RetailCustomerContactsService extends BaseService<RetailCustomerContacts> {
  constructor(@inject(RETAIL_CUSTOMER_CONTACTS_TYPES.Repository) repository: RetailCustomerContactsRepository) {
    super(repository);
  }
}
