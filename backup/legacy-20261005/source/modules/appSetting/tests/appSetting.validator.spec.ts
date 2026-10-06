jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

import { CreateAppSettingSchema, UpdateAppSettingSchema } from "../appSetting.validator";
import { ReferralTypeEnum } from "@/shared/constants/constance";

const basePayload = {
  order: {
    vat: 10,
    commission: 5,
    checkInDistanceThreshold: 150,
    orderStartNotificationMinutes: 30,
    urgentOrderAlertIntervalMinutes: 15,
    regularOrderAlertIntervalMinutes: 30,
    branchManagerRevenueShare: 12,
    accountantRevenueShare: 7,
    urgentOrderEnabled: true,
    urgentOrderHours: 2,
    urgentOrderSurchargePercent: 20,
    fragileItemSurchargePercent: 10,
  },
  customer: {
    referralBonus: 2,
    referralThreshold: 1000000,
  },
  employee: {
    salesTargetBonus: [
      {
        code: "sales-target-2026-06",
        type: ReferralTypeEnum.BONUS,
        daysWorking: 26,
        bonusValue: 1000000,
        daysOff: 1,
        percentOff: 5,
        percentFine: 3,
        appliedDate: new Date("2026-06-16T00:00:00.000Z"),
      },
    ],
    turnoverPenalty: {
      daysOff: 7,
      percentOff: 10,
      percentFine: 5,
    },
    uniform: 500000,
    margin: 1000000,
  },
  voucher: {
    minOrderValue: 500000,
    pointToMoneyRate: 1000,
  },
  notification: {
    preferences: ["SYSTEM"],
  },
};

describe("appSetting.validator order notification minutes", () => {
  it("preserves alert interval minutes in create payloads", () => {
    const parsed = CreateAppSettingSchema.parse(basePayload);

    expect(parsed.order).toMatchObject({
      vat: 10,
      commission: 5,
      checkInDistanceThreshold: 150,
      orderStartNotificationMinutes: 30,
      urgentOrderAlertIntervalMinutes: 15,
      regularOrderAlertIntervalMinutes: 30,
      branchManagerRevenueShare: 12,
      accountantRevenueShare: 7,
      urgentOrderEnabled: true,
      urgentOrderHours: 2,
      urgentOrderSurchargePercent: 20,
      fragileItemSurchargePercent: 10,
    });
  });

  it("preserves alert interval minutes in update payloads", () => {
    const parsed = UpdateAppSettingSchema.parse({
      order: {
        vat: 8,
        commission: 4,
        checkInDistanceThreshold: 120,
        orderStartNotificationMinutes: 45,
        urgentOrderAlertIntervalMinutes: 10,
        regularOrderAlertIntervalMinutes: 20,
        branchManagerRevenueShare: 15,
        accountantRevenueShare: 8,
        urgentOrderEnabled: false,
        urgentOrderHours: 3,
        urgentOrderSurchargePercent: 25,
        fragileItemSurchargePercent: 12,
      },
    });

    expect(parsed.order).toMatchObject({
      vat: 8,
      commission: 4,
      checkInDistanceThreshold: 120,
      orderStartNotificationMinutes: 45,
      urgentOrderAlertIntervalMinutes: 10,
      regularOrderAlertIntervalMinutes: 20,
      branchManagerRevenueShare: 15,
      accountantRevenueShare: 8,
      urgentOrderEnabled: false,
      urgentOrderHours: 3,
      urgentOrderSurchargePercent: 25,
      fragileItemSurchargePercent: 12,
    });
  });

  it("rejects a fractional alert interval", () => {
    expect(() =>
      CreateAppSettingSchema.parse({
        ...basePayload,
        order: {
          ...basePayload.order,
          urgentOrderAlertIntervalMinutes: 12.5,
          regularOrderAlertIntervalMinutes: 30,
        },
      }),
    ).toThrow();
  });
});
