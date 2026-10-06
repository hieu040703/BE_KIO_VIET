import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailShiftAssignments } from "@/database/models/retail/RetailGenericEntities";
import { RetailShiftAssignmentsRepository } from "./shiftAssignments.repository";
import { RETAIL_SHIFT_ASSIGNMENTS_TYPES } from "./shiftAssignments.types";

@injectable()
export class RetailShiftAssignmentsService extends BaseService<RetailShiftAssignments> {
  constructor(@inject(RETAIL_SHIFT_ASSIGNMENTS_TYPES.Repository) repository: RetailShiftAssignmentsRepository) {
    super(repository);
  }
}
