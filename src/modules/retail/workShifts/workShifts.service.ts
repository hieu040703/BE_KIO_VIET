import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailWorkShifts } from "@/database/models/retail/RetailGenericEntities";
import { RetailWorkShiftsRepository } from "./workShifts.repository";
import { RETAIL_WORK_SHIFTS_TYPES } from "./workShifts.types";

@injectable()
export class RetailWorkShiftsService extends BaseService<RetailWorkShifts> {
  constructor(@inject(RETAIL_WORK_SHIFTS_TYPES.Repository) repository: RetailWorkShiftsRepository) {
    super(repository);
  }
}
