import { injectable } from "inversify";
import { RetailSupplierContacts } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { SUPPLIERCONTACTS_RESOURCE } from "./supplierContacts.types";

@injectable()
export class RetailSupplierContactsRepository extends BaseRepository<RetailSupplierContacts> {
  protected entityClass = RetailSupplierContacts;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[SUPPLIERCONTACTS_RESOURCE];
  }
}
