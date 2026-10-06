import { injectable } from "inversify";
import { RetailShipmentItems } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { SHIPMENTITEMS_RESOURCE } from "./shipmentItems.types";

@injectable()
export class RetailShipmentItemsRepository extends BaseRepository<RetailShipmentItems> {
  protected entityClass = RetailShipmentItems;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[SHIPMENTITEMS_RESOURCE];
  }
}
