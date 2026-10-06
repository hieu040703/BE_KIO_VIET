import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailHolidays } from "@/database/models/retail/RetailGenericEntities";
import { RetailHolidaysRepository } from "./holidays.repository";
import { RETAIL_HOLIDAYS_TYPES } from "./holidays.types";

@injectable()
export class RetailHolidaysService extends BaseService<RetailHolidays> {
  constructor(@inject(RETAIL_HOLIDAYS_TYPES.Repository) repository: RetailHolidaysRepository) {
    super(repository);
  }
}
