import { resolveVoucherDiscountAmount } from "../serviceOrder.voucher";

describe("resolveVoucherDiscountAmount", () => {
  it("returns template amount for an available voucher owned by the customer", () => {
    const amount = resolveVoucherDiscountAmount({
      voucher: {
        customerId: "customer-1",
        isUsed: false,
        expiredAt: new Date("2026-12-31T00:00:00.000Z"),
      },
      customerId: "customer-1",
      templateAmount: 100_000,
      now: new Date("2026-06-15T00:00:00.000Z"),
    });

    expect(amount).toBe(100_000);
  });

  it("rejects a voucher that belongs to another customer", () => {
    expect(() =>
      resolveVoucherDiscountAmount({
        voucher: {
          customerId: "customer-2",
          isUsed: false,
          expiredAt: new Date("2026-12-31T00:00:00.000Z"),
        },
        customerId: "customer-1",
        templateAmount: 100_000,
      }),
    ).toThrow("Phiếu giảm giá không thuộc về khách hàng này");
  });

  it("rejects an expired voucher", () => {
    expect(() =>
      resolveVoucherDiscountAmount({
        voucher: {
          customerId: "customer-1",
          isUsed: false,
          expiredAt: new Date("2026-06-01T00:00:00.000Z"),
        },
        customerId: "customer-1",
        templateAmount: 100_000,
        now: new Date("2026-06-15T00:00:00.000Z"),
      }),
    ).toThrow("Phiếu giảm giá đã hết hạn");
  });
});
