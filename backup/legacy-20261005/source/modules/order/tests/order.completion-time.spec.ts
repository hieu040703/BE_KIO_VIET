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

import { CreateOrderSchema, UpdateOrderSchema } from "../order.validator";
import { OrderService } from "../order.service";

describe("Order estimated completion time", () => {
  const baseOrder = {
    branchId: "11111111-1111-4111-8111-111111111111",
    name: "Hợp đồng test",
    customerId: "22222222-2222-4222-8222-222222222222",
    timeAt: "2026-06-19T10:00:00.000Z",
    address: { address: "A", latitude: 10, longitude: 106 },
  };

  it("accepts an estimated completion time after the start time", () => {
    const parsed = CreateOrderSchema.parse({
      ...baseOrder,
      estimatedCompletionAt: "2026-06-19T12:00:00.000Z",
    });

    expect((parsed as any).estimatedCompletionAt).toEqual(new Date("2026-06-19T12:00:00.000Z"));
  });

  it("rejects an estimated completion time before or equal to the start time", () => {
    expect(() =>
      CreateOrderSchema.parse({
        ...baseOrder,
        estimatedCompletionAt: "2026-06-19T09:59:59.000Z",
      }),
    ).toThrow();

    expect(() =>
      CreateOrderSchema.parse({
        ...baseOrder,
        estimatedCompletionAt: baseOrder.timeAt,
      }),
    ).toThrow();
  });

  it("rejects an update with an estimated completion time before the new start time", () => {
    expect(() =>
      UpdateOrderSchema.parse({
        timeAt: "2026-06-19T12:00:00.000Z",
        estimatedCompletionAt: "2026-06-19T11:00:00.000Z",
      }),
    ).toThrow();
  });

  it("checks the persisted start time when only the estimated completion time is updated", async () => {
    const service = Object.create(OrderService.prototype) as OrderService;
    Object.assign(service as any, {
      orderRepository: {
        findById: jest.fn().mockResolvedValue({
          timeAt: new Date("2026-06-19T10:00:00.000Z"),
          estimatedCompletionAt: null,
        }),
      },
    });

    await expect(
      service.validateBeforeUpdate(
        "order-id",
        { estimatedCompletionAt: new Date("2026-06-19T09:00:00.000Z") },
        {} as any,
      ),
    ).rejects.toThrow("Thời gian hoàn thành phải sau thời gian bắt đầu");
  });
});
