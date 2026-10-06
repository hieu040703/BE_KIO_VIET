import { injectable, inject } from "inversify";
import { RetailSupplierAddressesService } from "./supplierAddresses.service";
import { RETAIL_SUPPLIER_ADDRESSES_TYPES } from "./supplierAddresses.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailSupplierAddressesController extends BaseController<RetailSupplierAddressesService> {
  constructor(@inject(RETAIL_SUPPLIER_ADDRESSES_TYPES.Service) protected service: RetailSupplierAddressesService) {
    super(service);
  }
}
