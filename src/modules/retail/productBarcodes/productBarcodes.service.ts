import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailProductBarcodes } from "@/database/models/retail/RetailGenericEntities";
import { RetailProductBarcodesRepository } from "./productBarcodes.repository";
import { RETAIL_PRODUCT_BARCODES_TYPES } from "./productBarcodes.types";

@injectable()
export class RetailProductBarcodesService extends BaseService<RetailProductBarcodes> {
  constructor(@inject(RETAIL_PRODUCT_BARCODES_TYPES.Repository) repository: RetailProductBarcodesRepository) {
    super(repository);
  }
}
