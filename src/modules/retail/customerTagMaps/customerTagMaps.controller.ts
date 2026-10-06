import { injectable, inject } from "inversify";
import { RetailCustomerTagMapsService } from "./customerTagMaps.service";
import { RETAIL_CUSTOMER_TAG_MAPS_TYPES } from "./customerTagMaps.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCustomerTagMapsController extends BaseController<RetailCustomerTagMapsService> {
  constructor(@inject(RETAIL_CUSTOMER_TAG_MAPS_TYPES.Service) protected service: RetailCustomerTagMapsService) {
    super(service);
  }
}
