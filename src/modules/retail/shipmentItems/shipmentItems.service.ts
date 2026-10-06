import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailShipmentItems } from "@/database/models/retail/RetailGenericEntities";
import { RetailShipmentItemsRepository } from "./shipmentItems.repository";
import { RETAIL_SHIPMENT_ITEMS_TYPES } from "./shipmentItems.types";

@injectable()
export class RetailShipmentItemsService extends BaseService<RetailShipmentItems> {
  constructor(@inject(RETAIL_SHIPMENT_ITEMS_TYPES.Repository) repository: RetailShipmentItemsRepository) {
    super(repository);
  }
}
