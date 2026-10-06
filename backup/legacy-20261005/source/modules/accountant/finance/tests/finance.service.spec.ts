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

import { FinanceService } from "../finance.service";
import { ExpenseApprovalStatusEnum, FinanceTypeEnum, OrderStatusEnum } from "@/shared/constants/constance";
import { FinanceCreationSourceEnum } from "../finance.types";

describe("FinanceService.attachMoreDataToSummary", () => {
  it("includes salary in totalExpense", async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ totalIncome: "100", totalExpense: "40" }),
    };
    const financeRepository = {
      getRepository: jest.fn().mockReturnValue({ createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) }),
      setOptions: jest.fn(),
    } as any;
    const service = new FinanceService(
      {} as any,
      {} as any,
      {} as any,
      financeRepository,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    const result = await service.attachMoreDataToSummary({}, {} as any);

    expect(result.totalExpense).toBe(40);
    expect(queryBuilder.setParameters).toHaveBeenCalledWith({
      incomeType: FinanceTypeEnum.INCOME,
      expenseTypes: [FinanceTypeEnum.EXPENSE, FinanceTypeEnum.SALARY],
    });
  });

  it("limits salary summary to salary records", async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ totalIncome: "0", totalExpense: "80" }),
    };
    const financeRepository = {
      getRepository: jest.fn().mockReturnValue({ createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) }),
      setOptions: jest.fn(),
    } as any;
    const service = new FinanceService(
      {} as any,
      {} as any,
      {} as any,
      financeRepository,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.attachMoreDataToSummary({}, { type: FinanceTypeEnum.SALARY } as any);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith("finance.type IN (:...summaryTypes)", {
      summaryTypes: [FinanceTypeEnum.SALARY],
    });
    expect(queryBuilder.setParameters).toHaveBeenCalledWith({
      incomeType: FinanceTypeEnum.INCOME,
      expenseTypes: [FinanceTypeEnum.SALARY],
    });
  });
});

describe("FinanceService.validateBeforeUpdate", () => {
  it("keeps an existing salary finance out of debt", async () => {
    const financeRepository = {
      findById: jest.fn().mockResolvedValue({ type: FinanceTypeEnum.SALARY }),
      setOptions: jest.fn(),
    } as any;
    const service = new FinanceService(
      {} as any,
      {} as any,
      {} as any,
      financeRepository,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
    const data: any = {};

    await service.validateBeforeUpdate("salary-finance-1", data);

    expect(data.isDebtRelated).toBe(false);
  });
});

describe("FinanceService.syncPendingSalaryAmount", () => {
  it("updates the linked pending salary finance amount", async () => {
    const financeRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: "salary-finance-1",
        amount: 1_000,
      }),
      update: jest.fn().mockResolvedValue({}),
      setOptions: jest.fn(),
    };
    const service = new FinanceService(
      {} as any,
      {} as any,
      {} as any,
      financeRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
    const manager = {} as any;

    await service.syncPendingSalaryAmount("time-keeping-confirm-1", 800, manager);

    expect(financeRepository.findOne).toHaveBeenCalledWith(
      {
        timeKeepingConfirmId: "time-keeping-confirm-1",
        type: FinanceTypeEnum.SALARY,
        status: ExpenseApprovalStatusEnum.PENDING,
      },
      manager,
    );
    expect(financeRepository.update).toHaveBeenCalledWith("salary-finance-1", { amount: 800 }, manager);
  });

  it("does not update a missing pending salary finance", async () => {
    const financeRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
      setOptions: jest.fn(),
    };
    const service = new FinanceService(
      {} as any,
      {} as any,
      {} as any,
      financeRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.syncPendingSalaryAmount("time-keeping-confirm-1", 800);

    expect(financeRepository.update).not.toHaveBeenCalled();
  });
});

describe("FinanceService income approval lifecycle", () => {
  const createService = (overrides: Record<string, any> = {}) =>
    new FinanceService(
      { getCode: jest.fn().mockResolvedValue({ data: { code: "THU-001" } }) } as any,
      {
        findById: jest.fn().mockResolvedValue({ status: OrderStatusEnum.COMPLETED }),
        getTotalIncomeByOrderId: jest.fn().mockResolvedValue(0),
      } as any,
      { checkExistNameAndType: jest.fn().mockResolvedValue(true) } as any,
      {
        fieldExists: jest.fn().mockResolvedValue(false),
        findByOptions: jest.fn().mockResolvedValue([]),
        ...overrides.financeRepository,
      } as any,
      { createTransactionFromFinance: jest.fn(), ...overrides.transactionService } as any,
      { findOne: jest.fn(), ...overrides.transactionRepository } as any,
      { create: jest.fn(), ...overrides.orderCommentService } as any,
      {} as any,
      { process: jest.fn(), ...overrides.calculateOrderData } as any,
      { findById: jest.fn().mockResolvedValue({ id: "customer-1" }) } as any,
      { calculateCustomerDebtAtTime: jest.fn().mockResolvedValue(0) } as any,
      {} as any,
    );

  it("puts a manually-created customer/order income into pending approval", async () => {
    const service = createService();
    const data: any = {
      type: FinanceTypeEnum.INCOME,
      customerId: "customer-1",
      orderPayments: [{ orderId: "order-1", amount: 100 }],
      amount: 100,
    };

    await service.validateBeforeCreate(data, undefined, undefined, FinanceCreationSourceEnum.MANUAL);

    expect(data.status).toBe(ExpenseApprovalStatusEnum.PENDING);
  });

  it("automatically approves a manually-created income without customer/order", async () => {
    const service = createService();
    const data: any = { type: FinanceTypeEnum.INCOME, amount: 100 };

    await service.validateBeforeCreate(data, undefined, undefined, FinanceCreationSourceEnum.MANUAL);

    expect(data.status).toBe(ExpenseApprovalStatusEnum.APPROVED);
  });

  it("automatically approves an internal income even when it is linked to an order", async () => {
    const service = createService();
    const data: any = {
      type: FinanceTypeEnum.INCOME,
      customerId: "customer-1",
      orderPayments: [{ orderId: "order-1", amount: 100 }],
      amount: 100,
    };

    await service.validateBeforeCreate(data, undefined, undefined, FinanceCreationSourceEnum.SYSTEM);

    expect(data.status).toBe(ExpenseApprovalStatusEnum.APPROVED);
  });

  it("does not create a transaction or recalculate an order while income is pending", async () => {
    const transactionService = { createTransactionFromFinance: jest.fn() };
    const calculateOrderData = { process: jest.fn() };
    const service = createService({
      transactionService,
      calculateOrderData,
      financeRepository: {
        findByOptions: jest.fn().mockResolvedValue([
          {
            id: "income-1",
            code: "THU-001",
            type: FinanceTypeEnum.INCOME,
            status: ExpenseApprovalStatusEnum.PENDING,
            orderId: "order-1",
            amount: 100,
            category: "Thu tiền hợp đồng",
          },
        ]),
      },
    });

    await service.actionAfterCreate(
      {
        id: "income-1",
        code: "THU-001",
        type: FinanceTypeEnum.INCOME,
        status: ExpenseApprovalStatusEnum.PENDING,
        orderId: "order-1",
        amount: 100,
        category: "Thu tiền hợp đồng",
      } as any,
    );

    expect(transactionService.createTransactionFromFinance).not.toHaveBeenCalled();
    expect(calculateOrderData.process).not.toHaveBeenCalled();
  });
});
