import { inject, injectable } from "inversify";
import { BaseService } from "@/shared/base/BaseService";
import { RetailEmployeeBranchAssignments } from "@/database/models/retail/RetailGenericEntities";
import { RetailEmployeeBranchAssignmentsRepository } from "./employeeBranchAssignments.repository";
import { RETAIL_EMPLOYEE_BRANCH_ASSIGNMENTS_TYPES } from "./employeeBranchAssignments.types";

@injectable()
export class RetailEmployeeBranchAssignmentsService extends BaseService<RetailEmployeeBranchAssignments> {
  constructor(@inject(RETAIL_EMPLOYEE_BRANCH_ASSIGNMENTS_TYPES.Repository) repository: RetailEmployeeBranchAssignmentsRepository) {
    super(repository);
  }
}
