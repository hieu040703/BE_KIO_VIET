import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailUnits } from "@/database/models/retail/RetailGenericEntities";
import { RetailUnitsRepository } from "./units.repository";
import { RETAIL_UNITS_TYPES } from "./units.types";

@injectable()
export class RetailUnitsService extends BaseService<RetailUnits> {
  constructor(@inject(RETAIL_UNITS_TYPES.Repository) repository: RetailUnitsRepository) {
    super(repository);
  }
}
