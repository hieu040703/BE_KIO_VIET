import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("../timeKeepingConfirm/timeKeepingConfirm.service", () => ({
  TimeKeepingConfirmService: class TimeKeepingConfirmService {},
}));

import { UserRoleEnum } from "@/shared/constants/constance";
import { TimeKeepingService } from "../timeKeeping.service";
import { TimeKeepingRepository } from "../timeKeeping.repository";

describe("TimeKeepingService employee data scope", () => {
  const employeeId = "employee-1";

  const createService = (employeeRepository: any, timeKeepingRepository: any) =>
    new TimeKeepingService(
      timeKeepingRepository,
      {} as any,
      employeeRepository,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

  it("limits the timekeeping list to the logged-in employee", async () => {
    const employeeRepository = {
      findWithPagination: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    };
    const service = createService(employeeRepository, {} as any);
    const req = {
      user: {
        userId: "user-1",
        username: "employee",
        role: UserRoleEnum.EMPLOYEE,
        employeeId,
        customerId: null,
      },
    } as any;

    await service.getTimeKeepingByAllEmployeeAndDate(
      { page: 1, size: 10, employeeIds: ["another-employee"] } as any,
      req,
    );

    expect(employeeRepository.findWithPagination).toHaveBeenCalledTimes(1);
    expect(employeeRepository.findWithPagination.mock.calls[0][0].where.id).toEqual(
      expect.objectContaining({ _value: [employeeId] }),
    );
  });

  it("limits the summary totals to the logged-in employee", async () => {
    const employeeRepository = {
      findWithPagination: jest.fn().mockResolvedValue({ data: [{ id: "another-employee" }], total: 1 }),
    };
    const timeKeepingRepository = {
      calculateTotalSalaryInTimeRange: jest.fn().mockResolvedValue(0),
      calculateTotalRealSalaryInTimeRange: jest.fn().mockResolvedValue(0),
      calculateTotalHoursInTimeRange: jest.fn().mockResolvedValue(0),
    };
    const service = createService(employeeRepository, timeKeepingRepository);
    const req = {
      query: { keyword: "another employee" },
      user: {
        userId: "user-1",
        username: "employee",
        role: UserRoleEnum.EMPLOYEE,
        employeeId,
        customerId: null,
      },
    } as any;

    await service.getAllTimeKeepingSummaryByEmployee(req);

    expect(timeKeepingRepository.calculateTotalSalaryInTimeRange).toHaveBeenCalledWith(
      undefined,
      undefined,
      [employeeId],
      undefined,
      false,
      undefined,
    );
    expect(timeKeepingRepository.calculateTotalRealSalaryInTimeRange).toHaveBeenCalledWith(
      undefined,
      undefined,
      [employeeId],
      undefined,
    );
    expect(timeKeepingRepository.calculateTotalHoursInTimeRange).toHaveBeenCalledWith(
      undefined,
      undefined,
      [employeeId],
      undefined,
    );
  });

  it("scopes direct timekeeping lookups to the logged-in employee", async () => {
    const repository = new TimeKeepingRepository();
    const queryBuilder = { andWhere: jest.fn() };
    const req = {
      user: {
        role: UserRoleEnum.EMPLOYEE,
        employeeId,
      },
    } as any;

    await (repository as any).extendQueryBuilder(queryBuilder, {}, req);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith("entity.employeeId = :employeeScopeId", {
      employeeScopeId: employeeId,
    });
  });
});
