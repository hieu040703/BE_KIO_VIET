import { injectable } from "inversify";
import { RetailCustomerTagMaps } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { CUSTOMERTAGMAPS_RESOURCE } from "./customerTagMaps.types";

@injectable()
export class RetailCustomerTagMapsRepository extends BaseRepository<RetailCustomerTagMaps> {
  protected entityClass = RetailCustomerTagMaps;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[CUSTOMERTAGMAPS_RESOURCE];
  }
}
