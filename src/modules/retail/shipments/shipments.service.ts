import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailShipments } from "@/database/models/retail/RetailGenericEntities";
import { RetailShipmentsRepository } from "./shipments.repository";
import { RETAIL_SHIPMENTS_TYPES } from "./shipments.types";

@injectable()
export class RetailShipmentsService extends BaseService<RetailShipments> {
  constructor(@inject(RETAIL_SHIPMENTS_TYPES.Repository) repository: RetailShipmentsRepository) {
    super(repository);
  }
}
