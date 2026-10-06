import { PositionDefaultEnum } from "@/shared/constants/constance";
import {
  AllocateRevenueToEmployeesSchema,
  CreateAllocateRevenueRecordSchema,
} from "../allocateRevenue.validator";

describe("allocateRevenue.validator API contracts", () => {
  it("parses revenue preview query values", () => {
    const parsed = AllocateRevenueToEmployeesSchema.parse({
      startAt: "2026-06-01T00:00:00.000Z",
      endAt: "2026-06-30T23:59:59.999Z",
      branchId: "11111111-1111-4111-8111-111111111111",
      revenueSharePercent: "10",
    });

    expect(parsed.startAt).toBeInstanceOf(Date);
    expect(parsed.endAt).toBeInstanceOf(Date);
    expect(parsed.revenueSharePercent).toBe(10);
  });

  it("parses confirm body and defaults branch-manager allocation type", () => {
    const parsed = CreateAllocateRevenueRecordSchema.parse({
      startAt: "2026-06-01T00:00:00.000Z",
      endAt: "2026-06-30T23:59:59.999Z",
      totalRevenue: 1000000,
      totalAllocatedRevenue: 200000,
      totalUnallocatedRevenue: 800000,
      totalRevenueToAllocate: 80000,
      employeeData: [
        {
          employeeId: "22222222-2222-4222-8222-222222222222",
          allocatedRevenue: "80000",
        },
      ],
      orderLeaderIds: ["33333333-3333-4333-8333-333333333333"],
    });

    expect(parsed.type).toBe(PositionDefaultEnum.BRANCH_MANAGER);
    expect(parsed.totalRevenueToAllocate).toBe(80000);
    expect(parsed.employeeData[0].allocatedRevenue).toBe(80000);
  });
});
