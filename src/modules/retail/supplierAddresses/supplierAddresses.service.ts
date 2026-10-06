import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailSupplierAddresses } from "@/database/models/retail/RetailGenericEntities";
import { RetailSupplierAddressesRepository } from "./supplierAddresses.repository";
import { RETAIL_SUPPLIER_ADDRESSES_TYPES } from "./supplierAddresses.types";

@injectable()
export class RetailSupplierAddressesService extends BaseService<RetailSupplierAddresses> {
  constructor(@inject(RETAIL_SUPPLIER_ADDRESSES_TYPES.Repository) repository: RetailSupplierAddressesRepository) {
    super(repository);
  }
}
