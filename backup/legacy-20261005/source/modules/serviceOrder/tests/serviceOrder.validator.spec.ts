import { randomUUID } from "crypto";
import { OrderFeeCategoryCodeEnum, ServiceOrderTypeEnum } from "@/shared/constants/constance";
import {
  ConfirmServiceOrderSchema,
  CustomerCreateServiceOrderSchema,
  CustomerEstimateServiceOrderPriceSchema,
  CustomerUpdateServiceOrderSchema,
  UpdateServiceOrderSchema,
} from "../serviceOrder.validator";

const address = { address: "Test", latitude: 10, longitude: 106 };

describe("service order pricing validators", () => {
  it("strips backend-owned fields from customer create and update", () => {
    const created = CustomerCreateServiceOrderSchema.parse({
      type: ServiceOrderTypeEnum.XE_NANG_XE_CAU,
      serviceId: randomUUID(),
      timeAt: "2026-06-18T10:00:00.000Z",
      address,
      servicePrices: [{ servicePriceId: randomUUID(), quantity: 1 }],
      isUrgent: true,
      amount: 1,
    });
    expect(created).not.toHaveProperty("isUrgent");
    expect(created).not.toHaveProperty("amount");
    expect(CustomerUpdateServiceOrderSchema.parse({ hasFragileItems: true, amount: 1 })).toEqual({
      hasFragileItems: true,
    });
  });

  it("accepts manual create without service prices", () => {
    expect(() =>
      CustomerCreateServiceOrderSchema.parse({
        type: ServiceOrderTypeEnum.CHUYEN_NHA_VAN_PHONG,
        serviceId: randomUUID(),
        timeAt: "2026-06-18T10:00:00.000Z",
        address,
        servicePrices: null,
      }),
    ).not.toThrow();
  });

  it("requires complete quote items for admin updates", () => {
    expect(() => UpdateServiceOrderSchema.parse({ quote: [{ key: "Phí", value: 10 }] })).toThrow();
    expect(
      UpdateServiceOrderSchema.parse({
        quote: [{ key: "Phí", value: 10, code: OrderFeeCategoryCodeEnum.EXPRESS_FEE, type: "inc" }],
      }).quote,
    ).toHaveLength(1);
  });

  it("accepts fragile selection in estimated price", () => {
    const parsed = CustomerEstimateServiceOrderPriceSchema.parse({
      type: ServiceOrderTypeEnum.XE_NANG_XE_CAU,
      serviceId: randomUUID(),
      timeAt: "2026-06-18T10:00:00.000Z",
      address,
      hasFragileItems: true,
      servicePrices: [{ servicePriceId: randomUUID() }],
    });
    expect(parsed.hasFragileItems).toBe(true);
  });

  it("requires branchManagerId in confirm payload", () => {
    expect(() =>
      ConfirmServiceOrderSchema.parse({
        branchId: randomUUID(),
        employeeId: randomUUID(),
      }),
    ).toThrow();

    expect(
      ConfirmServiceOrderSchema.parse({
        branchId: randomUUID(),
        branchManagerId: randomUUID(),
        employeeId: randomUUID(),
      }),
    ).toEqual(
      expect.objectContaining({
        branchId: expect.any(String),
        branchManagerId: expect.any(String),
        employeeId: expect.any(String),
      }),
    );
  });
});
