import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailProductUnits } from "@/database/models/retail/RetailGenericEntities";
import { RetailProductUnitsRepository } from "./productUnits.repository";
import { RETAIL_PRODUCT_UNITS_TYPES } from "./productUnits.types";

@injectable()
export class RetailProductUnitsService extends BaseService<RetailProductUnits> {
  constructor(@inject(RETAIL_PRODUCT_UNITS_TYPES.Repository) repository: RetailProductUnitsRepository) {
    super(repository);
  }
}
