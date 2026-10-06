import { injectable, inject } from "inversify";
import { RetailShipmentItemsService } from "./shipmentItems.service";
import { RETAIL_SHIPMENT_ITEMS_TYPES } from "./shipmentItems.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailShipmentItemsController extends BaseController<RetailShipmentItemsService> {
  constructor(@inject(RETAIL_SHIPMENT_ITEMS_TYPES.Service) protected service: RetailShipmentItemsService) {
    super(service);
  }
}
