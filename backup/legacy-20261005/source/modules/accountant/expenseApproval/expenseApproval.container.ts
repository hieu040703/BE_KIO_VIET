import { ContainerModule, ContainerModuleLoadOptions } from "inversify";
import { ExpenseApprovalController } from "./expenseApproval.controller";
import { ExpenseApprovalService } from "./expenseApproval.service";
import { ExpenseApprovalRepository } from "./expenseApproval.repository";
import { ExpenseApprovalRouter } from "./expenseApproval.route";
import { EXPENSE_APPROVAL_TYPES } from "./expenseApproval.types";

const expenseApprovalModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<ExpenseApprovalService>(EXPENSE_APPROVAL_TYPES.ExpenseApprovalService).to(ExpenseApprovalService);
  options
    .bind<ExpenseApprovalController>(EXPENSE_APPROVAL_TYPES.ExpenseApprovalController)
    .to(ExpenseApprovalController);
  options
    .bind<ExpenseApprovalRepository>(EXPENSE_APPROVAL_TYPES.ExpenseApprovalRepository)
    .to(ExpenseApprovalRepository);
  options.bind<ExpenseApprovalRouter>(EXPENSE_APPROVAL_TYPES.ExpenseApprovalRouter).to(ExpenseApprovalRouter);
});

export { expenseApprovalModule };
