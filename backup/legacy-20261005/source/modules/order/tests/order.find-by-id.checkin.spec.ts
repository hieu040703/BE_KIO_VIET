import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: { get: jest.fn() },
}));

jest.mock("@/shared/utils/firebase/firebase.utils", () => ({
  FirebaseUtils: {
    SentFirebaseWithUser: jest.fn(),
    SentFirebaseWithToken: jest.fn(),
    SentFirebaseWithTopic: jest.fn(),
  },
}));

import { OrderService } from "../order.service";

const createService = (orderEmployee: { checkInAt: Date | null } | null) => {
  const service = Object.create(OrderService.prototype) as any;

  service.repository = {
    findById: jest.fn().mockResolvedValue({ id: "order-1" }),
  };
  service.orderEmployeeRepository = {
    findByOption: jest.fn().mockResolvedValue(orderEmployee),
  };

  return service;
};

describe("OrderService.findById needCheckin", () => {
  it("returns true when the authenticated employee has not checked in", async () => {
    const service = createService({ checkInAt: null });
    const req = { user: { employeeId: "employee-1" } } as any;

    const result = await service.findById("order-1", req);

    expect(result.data.needCheckin).toBe(true);
    expect(service.orderEmployeeRepository.findByOption).toHaveBeenCalledWith(
      { where: { orderId: "order-1", employeeId: "employee-1" } },
      undefined,
    );
  });

  it("returns false after the authenticated employee has checked in", async () => {
    const service = createService({
      checkInAt: new Date("2026-08-26T02:00:00.000Z"),
    });
    const req = { user: { employeeId: "employee-1" } } as any;

    const result = await service.findById("order-1", req);

    expect(result.data.needCheckin).toBe(false);
  });

  it("returns false when the authenticated employee is not assigned to the order", async () => {
    const service = createService(null);
    const req = { user: { employeeId: "employee-1" } } as any;

    const result = await service.findById("order-1", req);

    expect(result.data.needCheckin).toBe(false);
  });
});
