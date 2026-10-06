export const RETAIL_EMPLOYEE_BRANCH_ASSIGNMENTS_TYPES = {
  Repository: Symbol.for("RetailEmployeeBranchAssignmentsRepository"),
  Service: Symbol.for("RetailEmployeeBranchAssignmentsService"),
  Controller: Symbol.for("RetailEmployeeBranchAssignmentsController"),
  Router: Symbol.for("RetailEmployeeBranchAssignmentsRouter"),
} as const;

export const EMPLOYEEBRANCHASSIGNMENTS_RESOURCE = "employee-branch-assignments" as const;
