import { Margin } from "@/database/models/Margin";
import { BranchSelectBasic } from "@/modules/branch/branch.select";
import { EmployeeSelectLite } from "@/modules/employee/employee.select";
import { UserSelectLite } from "@/modules/user/user.select";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const MarginSelectBasic: FindOptionsSelect<Margin> = {
  id: true,
  branchId: true,
  employeeId: true,
  code: true,
  amount: true,
  userId: true,
  timeAt: true,
  type: true,
  status: true,
  note: true,
};

export const MarginSelectFull: FindOptionsSelect<Margin> = {
  ...MarginSelectBasic,
  branch: BranchSelectBasic,
  employee: EmployeeSelectLite,
  user: UserSelectLite,
};

export const MarginRelations: FindOptionsRelations<Margin> = {
  branch: true,
  employee: true,
  user: true,
};
