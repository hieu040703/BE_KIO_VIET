import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

import {
  CustomerCareMethod,
  CustomerCareStatus,
} from "@/database/models/CustomerCare";
import { AdminCustomerCareService } from "../admin.customerCare.service";

describe("AdminCustomerCareService", () => {
  const customerRepository = {
    findById: jest.fn(),
  };
  const employeeRepository = {
    findById: jest.fn(),
  };
  const customerCareRepository = {
    findById: jest.fn(),
    setOptions: jest.fn(),
  };

  const createService = () =>
    new AdminCustomerCareService(
      customerCareRepository as any,
      customerRepository as any,
      employeeRepository as any,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    customerRepository.findById.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
    });
    employeeRepository.findById.mockResolvedValue({
      id: "22222222-2222-4222-8222-222222222222",
    });
  });

  const createData = (overrides: Record<string, unknown> = {}) => ({
    customerId: "11111111-1111-4111-8111-111111111111",
    employeeId: "22222222-2222-4222-8222-222222222222",
    method: CustomerCareMethod.CALL,
    status: CustomerCareStatus.SCHEDULED,
    scheduledAt: new Date("2026-06-28T08:00:00.000Z"),
    completedAt: null,
    nextFollowUpAt: null,
    note: null,
    ...overrides,
  });

  it("sets completedAt when a completed record has no completion time", async () => {
    const data = createData({
      status: CustomerCareStatus.COMPLETED,
      completedAt: null,
    });

    await createService().validateBeforeCreate(data as any);

    expect(data.completedAt).toBeInstanceOf(Date);
  });

  it("clears completedAt when status is not completed", async () => {
    const data = createData({
      status: CustomerCareStatus.SCHEDULED,
      completedAt: new Date("2026-06-28T09:00:00.000Z"),
    });

    await createService().validateBeforeCreate(data as any);

    expect(data.completedAt).toBeNull();
  });

  it("rejects next follow-up time that is not after scheduled time", async () => {
    const data = createData({
      nextFollowUpAt: new Date("2026-06-28T08:00:00.000Z"),
    });

    await expect(
      createService().validateBeforeCreate(data as any),
    ).rejects.toThrow(
      "Thời gian chăm sóc tiếp theo phải sau thời gian dự kiến",
    );
  });

  it("rejects a missing customer", async () => {
    customerRepository.findById.mockResolvedValue(null);

    await expect(
      createService().validateBeforeCreate(createData() as any),
    ).rejects.toThrow("Khách hàng không tồn tại");
  });

  it("rejects a missing employee", async () => {
    employeeRepository.findById.mockResolvedValue(null);

    await expect(
      createService().validateBeforeCreate(createData() as any),
    ).rejects.toThrow("Nhân viên chăm sóc không tồn tại");
  });

  it("clears completedAt when an existing completed record is rescheduled", async () => {
    customerCareRepository.findById.mockResolvedValue(
      createData({
        id: "33333333-3333-4333-8333-333333333333",
        status: CustomerCareStatus.COMPLETED,
        completedAt: new Date("2026-06-28T09:00:00.000Z"),
      }),
    );
    const updateData = {
      status: CustomerCareStatus.SCHEDULED,
    };

    await createService().validateBeforeUpdate(
      "33333333-3333-4333-8333-333333333333",
      updateData as any,
    );

    expect(updateData).toEqual({
      status: CustomerCareStatus.SCHEDULED,
      completedAt: null,
    });
  });
});
