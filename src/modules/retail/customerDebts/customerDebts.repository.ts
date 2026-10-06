import { injectable } from "inversify";
import { RetailCustomerDebts } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CUSTOMERDEBTS_RESOURCE } from "./customerDebts.types";

@injectable()
export class RetailCustomerDebtsRepository extends BaseRepository<RetailCustomerDebts> {
  protected entityClass = RetailCustomerDebts;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CUSTOMERDEBTS_RESOURCE];
  }
}
