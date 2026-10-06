import { injectable } from "inversify";
import { RetailCustomerContacts } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CUSTOMERCONTACTS_RESOURCE } from "./customerContacts.types";

@injectable()
export class RetailCustomerContactsRepository extends BaseRepository<RetailCustomerContacts> {
  protected entityClass = RetailCustomerContacts;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CUSTOMERCONTACTS_RESOURCE];
  }
}
