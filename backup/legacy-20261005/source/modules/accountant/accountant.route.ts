import { Router } from "express";
import { injectable, inject } from "inversify";
import { FinanceRouter } from "./finance/finance.route";
import { FINANCE_TYPES } from "./finance/finance.types";
import { DebtRouter } from "./debt/debt.route";
import { DEBT_TYPES } from "./debt/debt.types";
import { ADVANCE_SALARY_TYPES } from "./advanceSalary/advanceSalary.types";
import { AdvanceSalaryRouter } from "./advanceSalary/advanceSalary.route";
import { ADVANCE_EMPLOYEE_TYPES } from "./advanceEmployee/advanceEmployee.types";
import { AdvanceEmployeeRouter } from "./advanceEmployee/advanceEmployee.route";
import { MARGIN_TYPES } from "./margin/margin.types";
import { MarginRouter } from "./margin/margin.route";
import { EXPENSE_APPROVAL_TYPES } from "./expenseApproval/expenseApproval.types";
import { ExpenseApprovalRouter } from "./expenseApproval/expenseApproval.route";

@injectable()
export class AccountantRouter {
  private router: Router;

  constructor(
    @inject(FINANCE_TYPES.FinanceRouter) private financeRouter: FinanceRouter,
    @inject(ADVANCE_SALARY_TYPES.AdvanceSalaryRouter) private advanceSalaryRouter: AdvanceSalaryRouter,
    @inject(ADVANCE_EMPLOYEE_TYPES.AdvanceEmployeeRouter) private advanceEmployeeRouter: AdvanceEmployeeRouter,
    @inject(DEBT_TYPES.DebtRouter) private debtRouter: DebtRouter,
    @inject(MARGIN_TYPES.MarginRouter) private marginRouter: MarginRouter,
    @inject(EXPENSE_APPROVAL_TYPES.ExpenseApprovalRouter) private expenseApprovalRouter: ExpenseApprovalRouter,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use("/finances", this.financeRouter.getRouter());
    this.router.use("/advance-salary", this.advanceSalaryRouter.getRouter());
    this.router.use("/advance-employee", this.advanceEmployeeRouter.getRouter());
    this.router.use("/debts", this.debtRouter.getRouter());
    this.router.use("/margins", this.marginRouter.getRouter());
    this.router.use("/expense-approvals", this.expenseApprovalRouter.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
