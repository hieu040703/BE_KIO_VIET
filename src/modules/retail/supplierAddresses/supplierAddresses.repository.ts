import { injectable } from "inversify";
import { RetailSupplierAddresses } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { SUPPLIERADDRESSES_RESOURCE } from "./supplierAddresses.types";

@injectable()
export class RetailSupplierAddressesRepository extends BaseRepository<RetailSupplierAddresses> {
  protected entityClass = RetailSupplierAddresses;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[SUPPLIERADDRESSES_RESOURCE];
  }
}
