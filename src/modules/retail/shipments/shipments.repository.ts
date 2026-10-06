import { injectable } from "inversify";
import { RetailShipments } from "@/database/models/retail/RetailGenericEntities";
import { BaseRepository } from "@/shared/base/BaseRepository";
import { RETAIL_RESOURCES, RetailTableDefinition } from "../retail.types";
import { SHIPMENTS_RESOURCE } from "./shipments.types";

@injectable()
export class RetailShipmentsRepository extends BaseRepository<RetailShipments> {
  protected entityClass = RetailShipments;

  protected getDefinition(): RetailTableDefinition {
    return RETAIL_RESOURCES[SHIPMENTS_RESOURCE];
  }
}
