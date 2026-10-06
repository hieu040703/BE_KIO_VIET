import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("../handles/exportTKCPdf", () => ({
  exportTimeKeepingPfd: jest.fn(),
}));

jest.mock("@/modules/container", () => ({
  container: {
    get: jest.fn(),
  },
}));

import { TimeKeepingConfirmService } from "../timeKeepingConfirm.service";
import { OtherAmountTypeEnum, TimeKeepingTypeEnum, UserRoleEnum } from "@/shared/constants/constance";

describe("TimeKeepingConfirmService.delete", () => {
  it("deletes automatic margin timekeeping rows before deleting their margins", async () => {
    const tx = {};
    const req = {} as any;
    const timeKeepingConfirm = {
      id: "time-keeping-confirm-1",
      isPaid: false,
    };
    const marginTimeKeeping = {
      id: "time-keeping-1",
      marginId: "margin-1",
      otherAmountType: OtherAmountTypeEnum.MARGIN,
      type: TimeKeepingTypeEnum.IN,
    };

    const timeKeepingConfirmRepository = {
      findById: jest.fn().mockResolvedValue(timeKeepingConfirm),
      delete: jest.fn().mockResolvedValue(true),
      setOptions: jest.fn(),
      findOne: jest.fn(),
      fieldExists: jest.fn(),
    } as any;
    const timeKeepingRepository = {
      findByOptions: jest.fn().mockResolvedValue([marginTimeKeeping]),
      updateMany: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(true),
    } as any;
    const financeService = {
      findByOptions: jest.fn().mockResolvedValue({ data: [] }),
      delete: jest.fn(),
    } as any;
    const marginService = {
      delete: jest.fn().mockResolvedValue({}),
    } as any;
    const transactionManager = {
      withTransactionCallback: jest.fn((callback) => callback(tx)),
    } as any;

    const service = new TimeKeepingConfirmService(
      timeKeepingConfirmRepository,
      timeKeepingRepository,
      financeService,
      {} as any,
      marginService,
      {} as any,
      transactionManager,
    );

    await service.delete("time-keeping-confirm-1", req);

    expect(timeKeepingRepository.updateMany).toHaveBeenCalledWith(
      ["time-keeping-1"],
      { timeKeepingConfirmId: null, isPaid: false },
      tx,
    );
    expect(timeKeepingRepository.delete).toHaveBeenCalledWith("time-keeping-1", tx);
    expect(marginService.delete).toHaveBeenCalledWith("margin-1", req, tx);
    expect(timeKeepingRepository.delete.mock.invocationCallOrder[0]).toBeLessThan(
      marginService.delete.mock.invocationCallOrder[0],
    );
  });

  it("deletes the linked salary finance even when there are no timekeeping detail rows", async () => {
    const tx = {};
    const req = {} as any;
    const timeKeepingConfirm = {
      id: "time-keeping-confirm-2",
      isPaid: false,
    };
    const deleteLinkedSalaryFinance = jest.fn().mockResolvedValue({});

    const timeKeepingConfirmRepository = {
      findById: jest.fn().mockResolvedValue(timeKeepingConfirm),
      delete: jest.fn().mockResolvedValue(true),
      setOptions: jest.fn(),
      findOne: jest.fn(),
      fieldExists: jest.fn(),
    } as any;
    const timeKeepingRepository = {
      findByOptions: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn(),
    } as any;
    const financeService = {
      findByOptions: jest.fn().mockResolvedValue({
        data: [{ id: "salary-finance-2" }],
      }),
      deleteLinkedTimeKeepingConfirmFinance: deleteLinkedSalaryFinance,
    } as any;
    const transactionManager = {
      withTransactionCallback: jest.fn((callback) => callback(tx)),
    } as any;

    const service = new TimeKeepingConfirmService(
      timeKeepingConfirmRepository,
      timeKeepingRepository,
      financeService,
      {} as any,
      {} as any,
      {} as any,
      transactionManager,
    );

    await service.delete(timeKeepingConfirm.id, req);

    expect(deleteLinkedSalaryFinance).toHaveBeenCalledWith("salary-finance-2", req, tx);
    expect(timeKeepingConfirmRepository.delete).toHaveBeenCalledWith(timeKeepingConfirm.id, tx, req);
  });
});

describe("TimeKeepingConfirmService employee data scope", () => {
  it("uses employee-only search fields and list relations for approved salaries", async () => {
    const findWithPagination = jest.fn().mockResolvedValue({ data: [], total: 0 });
    const service = new TimeKeepingConfirmService(
      { findWithPagination } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.findAllWithPagination({ page: 1, size: 20, keyword: "Nguyễn" } as any, {} as any);

    const [options] = findWithPagination.mock.calls[0];
    expect(options.searchFields).toEqual(["employee.name", "employee.code"]);
    expect(options.select).not.toHaveProperty("timeKeepings");
    expect(options.relations).toEqual({ employee: true });
  });

  it("adds the logged-in employee filter to the approved salary list", async () => {
    const service = new TimeKeepingConfirmService(
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
    const options = { keyword: "another employee" } as any;
    const req = {
      user: {
        userId: "user-1",
        username: "employee",
        role: UserRoleEnum.EMPLOYEE,
        employeeId: "employee-1",
        customerId: null,
      },
    } as any;

    await service.validateBeforeQuery(options, req);

    expect(options.where).toEqual({ employeeId: "employee-1" });
  });

  it("does not expose another employee's approved salary details by id", async () => {
    const timeKeepingConfirmRepository = {
      findByTKCId: jest.fn().mockResolvedValue({
        employee: { id: "another-employee" },
      }),
    };
    const service = new TimeKeepingConfirmService(
      timeKeepingConfirmRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
    const req = {
      user: {
        userId: "user-1",
        username: "employee",
        role: UserRoleEnum.EMPLOYEE,
        employeeId: "employee-1",
        customerId: null,
      },
    } as any;

    await expect(service.findByTKCId("history-1", undefined, false, req)).rejects.toThrow(
      "Không tìm thấy phiếu chấm công",
    );
  });
});

describe("TimeKeepingConfirmService.updateHistory", () => {
  it("recalculates the history and syncs the linked pending salary finance", async () => {
    const tx = {};
    const req = {} as any;
    const history = {
      id: "time-keeping-confirm-1",
      isPaid: false,
      timeKeepings: [{ id: "time-keeping-1" }],
    };
    const updatedHistory = { ...history, totalRealSalary: 800 };
    const timeKeepingConfirmRepository = {
      findById: jest.fn().mockResolvedValueOnce(history).mockResolvedValueOnce(updatedHistory),
      calculateTimeKeepingConfirm: jest.fn().mockResolvedValue(undefined),
      setOptions: jest.fn(),
      findOne: jest.fn(),
      fieldExists: jest.fn(),
    } as any;
    const timeKeepingRepository = {
      updateMany: jest.fn().mockResolvedValue([]),
    } as any;
    const financeService = {
      syncPendingSalaryAmount: jest.fn().mockResolvedValue(undefined),
    } as any;
    const transactionManager = {
      withTransactionCallback: jest.fn((callback) => callback(tx)),
    } as any;

    const service = new TimeKeepingConfirmService(
      timeKeepingConfirmRepository,
      timeKeepingRepository,
      financeService,
      {} as any,
      {} as any,
      {} as any,
      transactionManager,
    );

    await service.updateHistory(
      history.id,
      { removeTimeKeepingIds: ["time-keeping-1"] },
      req,
    );

    expect(timeKeepingRepository.updateMany).toHaveBeenCalledWith(
      ["time-keeping-1"],
      { timeKeepingConfirmId: null, isPaid: false },
      tx,
    );
    expect(timeKeepingConfirmRepository.calculateTimeKeepingConfirm).toHaveBeenCalledWith(history, tx);
    expect(financeService.syncPendingSalaryAmount).toHaveBeenCalledWith(history.id, 800, tx);
  });

  it("rejects updates for a paid history", async () => {
    const timeKeepingConfirmRepository = {
      findById: jest.fn().mockResolvedValue({ id: "time-keeping-confirm-1", isPaid: true }),
      setOptions: jest.fn(),
      findOne: jest.fn(),
      fieldExists: jest.fn(),
    } as any;
    const financeService = { syncPendingSalaryAmount: jest.fn() } as any;
    const transactionManager = {
      withTransactionCallback: jest.fn((callback) => callback({})),
    } as any;

    const service = new TimeKeepingConfirmService(
      timeKeepingConfirmRepository,
      {} as any,
      financeService,
      {} as any,
      {} as any,
      {} as any,
      transactionManager,
    );

    await expect(
      service.updateHistory("time-keeping-confirm-1", { removeTimeKeepingIds: [] }),
    ).rejects.toThrow("Không thể cập nhật phiếu chấm công đã được thanh toán");
    expect(financeService.syncPendingSalaryAmount).not.toHaveBeenCalled();
  });
});
