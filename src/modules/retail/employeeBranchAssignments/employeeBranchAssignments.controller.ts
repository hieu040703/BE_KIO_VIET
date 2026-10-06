import { injectable, inject } from "inversify";
import { RetailEmployeeBranchAssignmentsService } from "./employeeBranchAssignments.service";
import { RETAIL_EMPLOYEE_BRANCH_ASSIGNMENTS_TYPES } from "./employeeBranchAssignments.types";
import { BaseController } from "@/shared/base/BaseController";

@injectable()
export class RetailEmployeeBranchAssignmentsController extends BaseController<RetailEmployeeBranchAssignmentsService> {
  constructor(@inject(RETAIL_EMPLOYEE_BRANCH_ASSIGNMENTS_TYPES.Service) protected service: RetailEmployeeBranchAssignmentsService) {
    super(service);
  }
}
