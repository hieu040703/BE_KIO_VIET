import { Finance } from "@/database/models/Finance";
import { BranchSelectBasic } from "@/modules/branch/branch.select";
import { CustomerSelectBasic, CustomerSelectLite } from "@/modules/customer/customer.select";
import { EmployeeSelectBasic, EmployeeSelectLite } from "@/modules/employee/employee.select";
import { OrderSelectBasic } from "@/modules/order/order.select";
import { UserSelectWithEmployee } from "@/modules/user/user.select";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const FinanceSelectBasic: FindOptionsSelect<Finance> = {
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
  invoiceNumber: true,
  isDebtRelated: true,
  isDeposit: true,
  isDeductedAdvanceSalary: true,
  expenseApprovalId: true,
  timeKeepingConfirmId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  note: true,
};

export const FinanceSelectFull: FindOptionsSelect<Finance> = {
  ...FinanceSelectBasic,
  branch: BranchSelectBasic,
  user: UserSelectWithEmployee,
  employee: EmployeeSelectLite,
  order: OrderSelectBasic,
  customer: CustomerSelectLite,
};

export const FinanceRelations: FindOptionsRelations<Finance> = {
  branch: true,
  user: { employee: true },
  employee: true,
  order: true,
  customer: true,
};
