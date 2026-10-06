import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { BranchSelectBasic } from "../../branch/branch.select";
import { UserSelectLite } from "../../user/user.select";
import { EmployeeSelectLite } from "../../employee/employee.select";
import { Finance } from "@/database/models/Finance";

export const AdvanceSalarySelectBasic: FindOptionsSelect<Finance> = {
  id: true,
  branchId: true,
  code: true,
  type: true,
  userId: true,
  category: true,
  amount: true,
  employeeId: true,
  timeAt: true,
  isDeductedAdvanceSalary: true,
  status: true,
  note: true,
};

export const AdvanceSalarySelectFull: FindOptionsSelect<Finance> = {
  ...AdvanceSalarySelectBasic,
  branch: BranchSelectBasic,
  user: UserSelectLite,
  employee: EmployeeSelectLite,
};

export const AdvanceSalaryRelations: FindOptionsRelations<Finance> = {
  branch: true,
  user: true,
  employee: true,
};
