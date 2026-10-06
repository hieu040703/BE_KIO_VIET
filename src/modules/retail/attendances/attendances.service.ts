import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailAttendance } from "@/database/models";
import { RetailAttendancesRepository } from "./attendances.repository";
import { RETAIL_ATTENDANCES_TYPES } from "./attendances.types";

@injectable()
export class RetailAttendancesService extends BaseService<RetailAttendance> {
  constructor(@inject(RETAIL_ATTENDANCES_TYPES.Repository) repository: RetailAttendancesRepository) {
    super(repository);
  }
}
