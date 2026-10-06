import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCustomerTagMaps } from "@/database/models/retail/RetailGenericEntities";
import { RetailCustomerTagMapsRepository } from "./customerTagMaps.repository";
import { RETAIL_CUSTOMER_TAG_MAPS_TYPES } from "./customerTagMaps.types";

@injectable()
export class RetailCustomerTagMapsService extends BaseService<RetailCustomerTagMaps> {
  constructor(@inject(RETAIL_CUSTOMER_TAG_MAPS_TYPES.Repository) repository: RetailCustomerTagMapsRepository) {
    super(repository);
  }
}
