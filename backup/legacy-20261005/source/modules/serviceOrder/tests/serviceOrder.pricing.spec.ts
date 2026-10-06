import { OrderFeeCategoryCodeEnum, ServiceOrderTypeEnum } from "@/shared/constants/constance";
import {
  buildServiceOrderPricing,
  calculateEstimatedServiceOrderPrice,
  isUrgentServiceOrder,
  mapServiceOrderQuoteToOrderPricing,
} from "../serviceOrder.pricing";

describe("service order quote pricing", () => {
  it("applies surcharges before voucher and keeps VAT separate", () => {
    const result = buildServiceOrderPricing({
      baseItems: [{ key: "Phí dịch vụ", value: 1_000_000, code: null, type: "inc" }],
      isUrgent: true,
      urgentSurchargePercent: 20,
      hasFragileItems: true,
      fragileItemSurchargePercent: 10,
      voucherDiscountAmount: 500_000,
      hasVat: true,
      vat: 10,
    });
    expect(result.quote.map(({ code, type, value }) => ({ code, type, value }))).toEqual([
      { code: null, type: "inc", value: 1_000_000 },
      { code: OrderFeeCategoryCodeEnum.URGENT, type: "inc", value: 200_000 },
      { code: OrderFeeCategoryCodeEnum.FRAGILE_ITEM, type: "inc", value: 100_000 },
      { code: OrderFeeCategoryCodeEnum.VOUCHER_DISCOUNT, type: "dec", value: 500_000 },
    ]);
    expect(result).toMatchObject({ basePrice: 1_000_000, preVatAmount: 800_000, vatAmount: 80_000, amount: 880_000 });
  });

  it("replaces managed rows without removing other fee codes", () => {
    const result = buildServiceOrderPricing({
      baseItems: [
        { key: "Phí", value: 1_000_000, code: null, type: "inc" },
        { key: "old", value: 1, code: OrderFeeCategoryCodeEnum.URGENT, type: "inc" },
        { key: "Cao tốc", value: 50_000, code: OrderFeeCategoryCodeEnum.EXPRESS_FEE, type: "inc" },
      ],
      isUrgent: true,
      urgentSurchargePercent: 20,
    });
    expect(result.quote.filter((item) => item.code === OrderFeeCategoryCodeEnum.URGENT)).toHaveLength(1);
    expect(result.quote.find((item) => item.code === OrderFeeCategoryCodeEnum.URGENT)?.value).toBe(200_000);
    expect(result.quote.some((item) => item.code === OrderFeeCategoryCodeEnum.EXPRESS_FEE)).toBe(true);
  });

  it.each([
    ["2026-06-18T10:00:00.000Z", true],
    ["2026-06-18T10:00:00.001Z", false],
    ["2026-06-18T07:59:59.999Z", false],
  ])("checks urgent time %s", (timeAt, expected) => {
    expect(
      isUrgentServiceOrder({
        enabled: true,
        urgentOrderHours: 2,
        timeAt: new Date(timeAt),
        now: new Date("2026-06-18T08:00:00.000Z"),
      }),
    ).toBe(expected);
  });

  it("returns VAT separately from estimated quote items", () => {
    const result = calculateEstimatedServiceOrderPrice({
      type: ServiceOrderTypeEnum.XE_NANG_XE_CAU,
      servicePrices: [{ price: 1_000_000, quantity: 1 }],
      baseItems: [],
      hasVat: true,
      vat: 10,
    });
    expect(result.items).toEqual([{ key: "Phí dịch vụ", value: 1_000_000, code: null, type: "inc" }]);
    expect(result).toMatchObject({ preVatAmount: 1_000_000, vat: 10, vatAmount: 100_000, totalPrice: 1_100_000 });
  });

  it("maps only increment rows to details", () => {
    expect(
      mapServiceOrderQuoteToOrderPricing([
        { key: "Phí", value: 1_000_000, code: null, type: "inc" },
        { key: "Voucher", value: 300_000, code: OrderFeeCategoryCodeEnum.VOUCHER_DISCOUNT, type: "dec" },
      ]),
    ).toEqual({
      discountAmount: 300_000,
      details: [{ name: "Phí", quantity: 1, price: 1_000_000, unit: "ca", total: 1_000_000 }],
    });
  });
});
