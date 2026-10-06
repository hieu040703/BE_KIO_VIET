import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

import { PositionDefaultEnum } from "@/shared/constants/constance";
import { AllocateRevenueService } from "../allocateRevenue.service";

describe("AllocateRevenueService allocation links", () => {
  const manager = {} as any;

  const createService = () => {
    const allocateRevenueRepository = {
      create: jest.fn().mockResolvedValue({ id: "allocate-revenue-1" }),
      findById: jest.fn().mockResolvedValue({ id: "allocate-revenue-1" }),
      softDelete: jest.fn().mockResolvedValue(true),
      setOptions: jest.fn(),
    } as any;
    const orderRepository = {
      calculateTotalRevenue: jest.fn(),
    } as any;
    const timeKeepingRepository = {
      create: jest.fn().mockResolvedValue({}),
      findByOptions: jest.fn().mockResolvedValue([]),
      softDeleteMany: jest.fn(),
    } as any;
    const orderLeaderRepository = {
      findByOption: jest.fn().mockResolvedValue({ id: "order-leader-1" }),
      update: jest.fn().mockResolvedValue({}),
      findByOptions: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn(),
    } as any;

    const service = new AllocateRevenueService(
      allocateRevenueRepository,
      orderRepository,
      timeKeepingRepository,
      orderLeaderRepository,
    );

    return {
      service,
      allocateRevenueRepository,
      timeKeepingRepository,
      orderLeaderRepository,
    };
  };

  it("links created timekeepings and allocated order leaders to the allocate revenue record", async () => {
    const { service, timeKeepingRepository, orderLeaderRepository } = createService();

    await service.allocateRevenueToEmployees(
      {
        startAt: new Date("2026-06-01T00:00:00.000Z"),
        endAt: new Date("2026-06-30T23:59:59.999Z"),
        type: PositionDefaultEnum.BRANCH_MANAGER,
        totalRevenue: 1000000,
        totalAllocatedRevenue: 200000,
        totalUnallocatedRevenue: 800000,
        totalRevenueToAllocate: 80000,
        employeeData: [{ employeeId: "employee-1", allocatedRevenue: 80000 }],
        orderLeaderIds: ["order-leader-1"],
      },
      manager,
    );

    expect(timeKeepingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        employeeId: "employee-1",
        salary: 80000,
        isRevenueShareAllocation: true,
        allocateRevenueId: "allocate-revenue-1",
      }),
      manager,
    );

    expect(orderLeaderRepository.update).toHaveBeenCalledWith(
      "order-leader-1",
      {
        isRevenueShareAllocated: true,
        allocateRevenueId: "allocate-revenue-1",
      },
      manager,
    );
  });

  it("soft-deletes allocate revenue and linked timekeepings, then resets linked order leaders", async () => {
    const { service, allocateRevenueRepository, timeKeepingRepository, orderLeaderRepository } = createService();
    timeKeepingRepository.findByOptions.mockResolvedValueOnce([{ id: "timekeeping-1" }]);
    orderLeaderRepository.findByOptions.mockResolvedValueOnce([{ id: "order-leader-1" }]);

    await service.delete("allocate-revenue-1", undefined, manager);

    expect(allocateRevenueRepository.softDelete).toHaveBeenCalledWith("allocate-revenue-1", manager, undefined);
    expect(timeKeepingRepository.softDeleteMany).toHaveBeenCalledWith(["timekeeping-1"], manager);
    expect(orderLeaderRepository.updateMany).toHaveBeenCalledWith(
      ["order-leader-1"],
      {
        isRevenueShareAllocated: false,
        allocateRevenueId: null,
      },
      manager,
    );
  });
});
