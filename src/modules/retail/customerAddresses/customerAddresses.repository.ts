import { injectable } from "inversify";
import { RetailCustomerAddresses } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CUSTOMERADDRESSES_RESOURCE } from "./customerAddresses.types";

@injectable()
export class RetailCustomerAddressesRepository extends BaseRepository<RetailCustomerAddresses> {
  protected entityClass = RetailCustomerAddresses;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CUSTOMERADDRESSES_RESOURCE];
  }
}
