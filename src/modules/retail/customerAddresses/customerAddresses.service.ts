import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailCustomerAddresses } from "@/database/models/retail/RetailGenericEntities";
import { RetailCustomerAddressesRepository } from "./customerAddresses.repository";
import { RETAIL_CUSTOMER_ADDRESSES_TYPES } from "./customerAddresses.types";

@injectable()
export class RetailCustomerAddressesService extends BaseService<RetailCustomerAddresses> {
  constructor(@inject(RETAIL_CUSTOMER_ADDRESSES_TYPES.Repository) repository: RetailCustomerAddressesRepository) {
    super(repository);
  }
}
