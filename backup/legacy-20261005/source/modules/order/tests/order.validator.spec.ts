import { randomUUID } from "crypto";
import { OrderStatusEnum } from "@/shared/constants/constance";
import { AdminOrderCheckInSchema, CreateOrderSchema, UpdateOrderSchema } from "../order.validator";

describe("CreateOrderSchema branch manager contract", () => {
  it("accepts branchManagerId as a separate field from employeeId", () => {
    const parsed = CreateOrderSchema.parse({
      branchId: randomUUID(),
      branchManagerId: randomUUID(),
      name: "Hợp đồng test",
      customerId: randomUUID(),
      employeeId: randomUUID(),
      timeAt: "2026-06-19T10:00:00.000Z",
      address: { address: "A", latitude: 10, longitude: 106 },
      status: OrderStatusEnum.PENDING,
    });

    expect(parsed.branchManagerId).toEqual(expect.any(String));
    expect(parsed.employeeId).toEqual(expect.any(String));
  });

  it("accepts the creator reward percent but strips client-controlled creator and payment fields", () => {
    const parsed = CreateOrderSchema.parse({
      branchId: randomUUID(),
      name: "Hợp đồng test",
      customerId: randomUUID(),
      timeAt: "2026-06-19T10:00:00.000Z",
      address: { address: "A", latitude: 10, longitude: 106 },
      createdByEmployeeId: randomUUID(),
      createdByEmployeePercent: 8,
      isPaidForEmployeeCreateOrder: true,
    });

    expect(parsed.createdByEmployeePercent).toBe(8);
    expect(parsed).not.toHaveProperty("createdByEmployeeId");
    expect(parsed).not.toHaveProperty("isPaidForEmployeeCreateOrder");
  });

  it("accepts the branch manager revenue allocation percent", () => {
    const parsed = CreateOrderSchema.parse({
      branchId: randomUUID(),
      name: "Hợp đồng test",
      customerId: randomUUID(),
      timeAt: "2026-06-19T10:00:00.000Z",
      address: { address: "A", latitude: 10, longitude: 106 },
      allocateRevenuePercent: 18,
    });

    expect(parsed.allocateRevenuePercent).toBe(18);
  });
});

describe("UpdateOrderSchema creator reward contract", () => {
  it("does not allow creator identity, reward percent, or paid status to be updated", () => {
    const parsed = UpdateOrderSchema.parse({
      createdByEmployeeId: randomUUID(),
      createdByEmployeePercent: 99,
      isPaidForEmployeeCreateOrder: true,
    });

    expect(parsed).not.toHaveProperty("createdByEmployeeId");
    expect(parsed).not.toHaveProperty("createdByEmployeePercent");
    expect(parsed).not.toHaveProperty("isPaidForEmployeeCreateOrder");
  });

  it("allows the branch manager revenue allocation percent to be updated", () => {
    const parsed = UpdateOrderSchema.parse({ allocateRevenuePercent: 18 });

    expect(parsed.allocateRevenuePercent).toBe(18);
  });
});

describe("AdminOrderCheckInSchema", () => {
  it("accepts valid latitude and longitude", () => {
    expect(AdminOrderCheckInSchema.parse({ latitude: 21.02917, longitude: 105.77728 })).toEqual({
      latitude: 21.02917,
      longitude: 105.77728,
    });
  });

  it("rejects coordinates outside the geographic bounds", () => {
    expect(() => AdminOrderCheckInSchema.parse({ latitude: 91, longitude: 105.77728 })).toThrow();
    expect(() => AdminOrderCheckInSchema.parse({ latitude: 21.02917, longitude: 181 })).toThrow();
  });
});
