import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: {
    get: jest.fn(),
  },
}));

import { ExpenseApprovalService } from "../expenseApproval.service";
import { ExpenseApprovalStatusEnum, FinanceTypeEnum } from "@/shared/constants/constance";
import { ExpenseApprovalQuerySchema } from "../expenseApproval.validator";

describe("ExpenseApprovalQuerySchema", () => {
  it("preserves the receipt direction for the approval endpoint", () => {
    expect(ExpenseApprovalQuerySchema.parse({ direction: FinanceTypeEnum.INCOME }).direction).toBe(
      FinanceTypeEnum.INCOME,
    );
  });
});

describe("ExpenseApprovalService.getAllExpenses", () => {
  it("returns salary records separately from other expenses", async () => {
    const financeRepository = {
      findByOptions: jest.fn(async (options: any) => {
        if (options.where.type === FinanceTypeEnum.SALARY) {
          return [{ id: "salary-1", type: FinanceTypeEnum.SALARY, amount: 10_000_000 }];
        }
        return [{ id: "expense-1", type: FinanceTypeEnum.EXPENSE, amount: 500_000 }];
      }),
    } as any;

    const emptyFindRepository = { findByOptions: jest.fn().mockResolvedValue([]) } as any;

    const service = new ExpenseApprovalService(
      {} as any,
      {} as any,
      financeRepository,
      {} as any,
      emptyFindRepository,
      {} as any,
      emptyFindRepository,
      {} as any,
      emptyFindRepository,
      emptyFindRepository,
      {} as any,
      {} as any,
    );

    const result = await service.getAllExpenses({} as any);

    expect(result.data).toEqual(
      expect.objectContaining({
        salaries: [{ id: "salary-1", type: FinanceTypeEnum.SALARY, amount: 10_000_000 }],
        expenses: [{ id: "expense-1", type: FinanceTypeEnum.EXPENSE, amount: 500_000 }],
      }),
    );
    expect(financeRepository.findByOptions).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: FinanceTypeEnum.SALARY }) }),
      undefined,
    );

    [...financeRepository.findByOptions.mock.calls, ...emptyFindRepository.findByOptions.mock.calls].forEach(
      ([options]) => {
        expect(options.select.user.employee).toEqual(
          expect.objectContaining({ name: true, zaloName: true }),
        );
        expect(options.relations.user).toEqual({ employee: true });
      },
    );
  });

  it("returns only pending customer/order incomes for the receipt direction", async () => {
    const income = {
      id: "income-1",
      code: "THU-001",
      type: FinanceTypeEnum.INCOME,
      status: ExpenseApprovalStatusEnum.PENDING,
      customerId: "customer-1",
      orderId: "order-1",
      amount: 100,
    };
    const financeRepository = {
      findByOptions: jest.fn().mockResolvedValue([income]),
    } as any;
    const emptyFindRepository = { findByOptions: jest.fn().mockResolvedValue([]) } as any;
    const service = new ExpenseApprovalService(
      {} as any,
      {} as any,
      financeRepository,
      {} as any,
      emptyFindRepository,
      {} as any,
      emptyFindRepository,
      {} as any,
      emptyFindRepository,
      emptyFindRepository,
      {} as any,
      {} as any,
    );

    const result = await service.getAllExpenses({ direction: FinanceTypeEnum.INCOME } as any);

    expect(result.data).toEqual(expect.objectContaining({ incomes: [income] }));
    expect(financeRepository.findByOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: FinanceTypeEnum.INCOME,
          status: ExpenseApprovalStatusEnum.PENDING,
        }),
      }),
      undefined,
    );
  });
});

describe("ExpenseApprovalService.confirmExpenseApproval", () => {
  it("approves salary records and marks the linked timekeeping confirmation as paid", async () => {
    const salary = {
      id: "salary-1",
      type: FinanceTypeEnum.SALARY,
      amount: 10_000_000,
      timeKeepingConfirmId: "time-keeping-confirm-1",
    };
    const financeRepository = {
      findByOptions: jest.fn().mockResolvedValue([salary]),
    } as any;
    const financeService = { update: jest.fn().mockResolvedValue({}) } as any;
    const expenseApprovalRepository = {
      create: jest.fn().mockResolvedValue({ id: "approval-1" }),
      update: jest.fn().mockResolvedValue({}),
    } as any;
    const timeKeepingConfirmRepository = {
      updatePaidStatus: jest.fn().mockResolvedValue({}),
    } as any;
    const transactionService = {
      createTransactionFromFinance: jest.fn(),
    } as any;
    const emptyFindRepository = { findByOptions: jest.fn().mockResolvedValue([]) } as any;

    const service = new ExpenseApprovalService(
      expenseApprovalRepository,
      {} as any,
      financeRepository,
      financeService,
      emptyFindRepository,
      {} as any,
      emptyFindRepository,
      {} as any,
      {} as any,
      {} as any,
      transactionService,
      timeKeepingConfirmRepository,
    );

    await service.confirmExpenseApproval(
      {
        direction: FinanceTypeEnum.EXPENSE,
        incomeIds: [],
        salaryIds: [salary.id],
        expenseIds: [],
        advanceEmployeeIds: [],
        advanceSalaryIds: [],
        marginIds: [],
      },
      { user: { userId: "user-1" } } as any,
    );

    expect(financeService.update).toHaveBeenCalledWith(
      salary.id,
      { expenseApprovalId: "approval-1", status: "APPROVED" },
      expect.anything(),
      undefined,
    );
    expect(timeKeepingConfirmRepository.updatePaidStatus).toHaveBeenCalledWith(
      salary.timeKeepingConfirmId,
      undefined,
    );
    expect(transactionService.createTransactionFromFinance).not.toHaveBeenCalled();
  });

  it("approves all pending income rows sharing a selected receipt code", async () => {
    const incomes = [
      {
        id: "income-1",
        code: "THU-001",
        type: FinanceTypeEnum.INCOME,
        status: ExpenseApprovalStatusEnum.PENDING,
        customerId: "customer-1",
        orderId: "order-1",
        amount: 100,
      },
      {
        id: "income-2",
        code: "THU-001",
        type: FinanceTypeEnum.INCOME,
        status: ExpenseApprovalStatusEnum.PENDING,
        customerId: "customer-1",
        orderId: "order-2",
        amount: 200,
      },
    ];
    const financeRepository = {
      findByOptions: jest.fn().mockResolvedValueOnce([incomes[0]]).mockResolvedValueOnce(incomes),
    } as any;
    const financeService = { update: jest.fn().mockResolvedValue({}) } as any;
    const expenseApprovalRepository = {
      create: jest.fn().mockResolvedValue({ id: "approval-1" }),
      update: jest.fn().mockResolvedValue({}),
    } as any;
    const service = new ExpenseApprovalService(
      expenseApprovalRepository,
      {} as any,
      financeRepository,
      financeService,
      { findByOptions: jest.fn().mockResolvedValue([]) } as any,
      {} as any,
      { findByOptions: jest.fn().mockResolvedValue([]) } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.confirmExpenseApproval(
      {
        direction: FinanceTypeEnum.INCOME,
        incomeIds: ["income-1"],
        salaryIds: [],
        expenseIds: [],
        advanceEmployeeIds: [],
        advanceSalaryIds: [],
        marginIds: [],
      } as any,
      { user: { userId: "user-1" } } as any,
    );

    expect(financeService.update).toHaveBeenCalledTimes(2);
    expect(financeService.update).toHaveBeenCalledWith(
      "income-2",
      { expenseApprovalId: "approval-1", status: ExpenseApprovalStatusEnum.APPROVED },
      expect.anything(),
      undefined,
    );
  });
});

describe("ExpenseApprovalService.deleteItemFromExpenseApproval", () => {
  it("deletes a salary item through FinanceService", async () => {
    const financeService = { delete: jest.fn().mockResolvedValue({}) } as any;
    const service = new ExpenseApprovalService(
      {} as any,
      {} as any,
      {} as any,
      financeService,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.deleteItemFromExpenseApproval("salary-1", FinanceTypeEnum.SALARY, undefined, undefined);

    expect(financeService.delete).toHaveBeenCalledWith("salary-1", undefined, undefined);
  });

  it("deletes an income item through FinanceService", async () => {
    const financeService = { delete: jest.fn().mockResolvedValue({}) } as any;
    const service = new ExpenseApprovalService(
      {} as any,
      {} as any,
      {} as any,
      financeService,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.deleteItemFromExpenseApproval("income-1", FinanceTypeEnum.INCOME, undefined, undefined);

    expect(financeService.delete).toHaveBeenCalledWith("income-1", undefined, undefined);
  });
});
