import { injectable, inject } from "inversify";
import { RetailCustomerAddressesService } from "./customerAddresses.service";
import { RETAIL_CUSTOMER_ADDRESSES_TYPES } from "./customerAddresses.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailCustomerAddressesController extends BaseController<RetailCustomerAddressesService> {
  constructor(@inject(RETAIL_CUSTOMER_ADDRESSES_TYPES.Service) protected service: RetailCustomerAddressesService) {
    super(service);
  }
}
