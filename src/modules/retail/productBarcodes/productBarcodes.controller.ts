import { injectable, inject } from "inversify";
import { RetailProductBarcodesService } from "./productBarcodes.service";
import { RETAIL_PRODUCT_BARCODES_TYPES } from "./productBarcodes.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailProductBarcodesController extends BaseController<RetailProductBarcodesService> {
  constructor(@inject(RETAIL_PRODUCT_BARCODES_TYPES.Service) protected service: RetailProductBarcodesService) {
    super(service);
  }
}
