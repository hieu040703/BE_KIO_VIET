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

import { FinanceTypeEnum } from "@/shared/constants/constance";
import { FinanceRepository } from "../finance.repository";

describe("FinanceRepository.extendQueryBuilder", () => {
  it("includes salary when no finance type filter is provided", async () => {
    const queryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
    };
    const repository = new FinanceRepository();

    await repository.extendQueryBuilder(queryBuilder as any, {} as any);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith("entity.type IN (:...financeTypes)", {
      financeTypes: [FinanceTypeEnum.EXPENSE, FinanceTypeEnum.INCOME, FinanceTypeEnum.SALARY],
    });
  });

  it("excludes salary when the regular finance list requests it", async () => {
    const queryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
    };
    const repository = new FinanceRepository();

    await repository.extendQueryBuilder(queryBuilder as any, { excludeSalary: true } as any);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith("entity.type IN (:...financeTypes)", {
      financeTypes: [FinanceTypeEnum.EXPENSE, FinanceTypeEnum.INCOME],
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith("entity.type != :excludedSalaryType", {
      excludedSalaryType: FinanceTypeEnum.SALARY,
    });
  });
});
