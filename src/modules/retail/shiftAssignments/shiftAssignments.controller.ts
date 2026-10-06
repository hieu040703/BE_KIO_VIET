import { injectable, inject } from "inversify";
import { RetailShiftAssignmentsService } from "./shiftAssignments.service";
import { RETAIL_SHIFT_ASSIGNMENTS_TYPES } from "./shiftAssignments.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailShiftAssignmentsController extends BaseController<RetailShiftAssignmentsService> {
  constructor(@inject(RETAIL_SHIFT_ASSIGNMENTS_TYPES.Service) protected service: RetailShiftAssignmentsService) {
    super(service);
  }
}
