import { injectable, inject } from "inversify";
import { RetailCustomerContactsService } from "./customerContacts.service";
import { RETAIL_CUSTOMER_CONTACTS_TYPES } from "./customerContacts.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCustomerContactsController extends BaseController<RetailCustomerContactsService> {
  constructor(@inject(RETAIL_CUSTOMER_CONTACTS_TYPES.Service) protected service: RetailCustomerContactsService) {
    super(service);
  }
}
