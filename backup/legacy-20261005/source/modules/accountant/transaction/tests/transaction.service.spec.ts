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

import { TransactionService } from "../transaction.service";
import { FinanceTypeEnum, TransactionTypeEnum } from "@/shared/constants/constance";

describe("TransactionService.createTransactionFromFinance", () => {
  it("creates an OUT transaction for a salary finance", async () => {
    const transactionRepository = {
      findOneByField: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
    } as any;
    const commonService = {
      getCode: jest.fn().mockResolvedValue({ data: { code: "GD0001" } }),
    } as any;

    const service = new TransactionService(transactionRepository, {} as any, commonService);
    const finance = {
      id: "finance-salary-1",
      type: FinanceTypeEnum.SALARY,
      amount: 12_000_000,
      timeAt: new Date("2026-08-28T00:00:00.000Z"),
      note: "Chi lương tháng 08/2026",
    } as any;

    await service.createTransactionFromFinance(finance);

    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        financeId: finance.id,
        type: TransactionTypeEnum.OUT,
        amount: finance.amount,
      }),
      undefined,
    );
  });
});
