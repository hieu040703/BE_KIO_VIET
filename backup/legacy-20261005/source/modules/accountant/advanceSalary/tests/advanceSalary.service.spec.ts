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

import { AdvanceSalaryService } from "../advanceSalary.service";

describe("AdvanceSalaryService.delete", () => {
  it("deletes linked timekeeping before the finance record", async () => {
    const tx = {};
    let linkedTimeKeepingExists = true;

    const advanceSalaryRepository = {
      findById: jest.fn().mockResolvedValue({ id: "advance-salary-1" }),
      delete: jest.fn().mockImplementation(async () => {
        if (linkedTimeKeepingExists) {
          throw new Error("FK violation: timekeeping still references advance salary");
        }

        return true;
      }),
      setOptions: jest.fn(),
    } as any;
    const timeKeepingRepository = {
      findOne: jest.fn().mockImplementation(async () => {
        return linkedTimeKeepingExists ? { id: "time-keeping-1" } : null;
      }),
      delete: jest.fn().mockImplementation(async () => {
        linkedTimeKeepingExists = false;
        return true;
      }),
    } as any;
    const transactionManager = {
      withTransactionCallback: jest.fn((callback) => callback(tx)),
    } as any;
    const transactionService = {
      deleteTransactionFromAdvanceSalary: jest.fn(),
    } as any;

    const service = new AdvanceSalaryService(
      advanceSalaryRepository,
      transactionManager,
      {} as any,
      transactionService,
      {} as any,
      timeKeepingRepository,
    );

    await expect(service.delete("advance-salary-1")).resolves.toBeDefined();

    expect(timeKeepingRepository.delete).toHaveBeenCalledWith("time-keeping-1", tx);
    expect(timeKeepingRepository.delete).toHaveBeenCalledTimes(1);
    expect(advanceSalaryRepository.delete).toHaveBeenCalledWith("advance-salary-1", tx, undefined);
  });
});
