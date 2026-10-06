import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { BranchSelectBasic } from "../../branch/branch.select";
import { UserSelectLite } from "../../user/user.select";
import { EmployeeSelectLite } from "../../employee/employee.select";
import { OrderSelectBasic } from "../../order/order.select";
import { Finance } from "@/database/models/Finance";

export const AdvanceEmployeeSelectBasic: FindOptionsSelect<Finance> = {
  id: true,
  branchId: true,
  code: true,
  type: true,
  userId: true,
  category: true,
  amount: true,
  employeeId: true,
  customerId: true,
  orderId: true,
  timeAt: true,
  status: true,
  note: true,
};

export const AdvanceEmployeeSelectFull: FindOptionsSelect<Finance> = {
  ...AdvanceEmployeeSelectBasic,
  branch: BranchSelectBasic,
  user: UserSelectLite,
  employee: EmployeeSelectLite,
  order: OrderSelectBasic,
};

export const AdvanceEmployeeRelations: FindOptionsRelations<Finance> = {
  branch: true,
  user: true,
  employee: true,
  order: true,
};
