import { ExpenseApproval } from "@/database/models/ExpenseApproval";
import { UserSelectLite } from "@/modules/user/user.select";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const ExpenseApprovalSelectBasic: FindOptionsSelect<ExpenseApproval> = {
  id: true,
  timeAt: true,
  requestedBy: true,
  approvedBy: true,
  approvedAt: true,
  isConfirm: true,
  amount: true,
  note: true,
};

export const ExpenseApprovalSelectFull: FindOptionsSelect<ExpenseApproval> = {
  ...ExpenseApprovalSelectBasic,
  requestedUser: UserSelectLite,
  approvedUser: UserSelectLite,
};

export const ExpenseApprovalRelations: FindOptionsRelations<ExpenseApproval> = {
  requestedUser: true,
  approvedUser: true,
};
