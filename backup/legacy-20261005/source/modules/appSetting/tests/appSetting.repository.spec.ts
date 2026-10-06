import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

import { AppSettingRepository } from "../appSetting.repository";

describe("AppSettingRepository orderStartNotificationMinutes", () => {
  it("returns configured orderStartNotificationMinutes from the first app setting", async () => {
    const repository = new AppSettingRepository();
    repository.findAll = jest.fn().mockResolvedValue([
      {
        order: {
          orderStartNotificationMinutes: 25,
        },
      },
    ] as any);

    await expect(repository.getOrderStartNotificationMinutes()).resolves.toBe(25);
  });

  it("falls back to 0 when orderStartNotificationMinutes is missing", async () => {
    const repository = new AppSettingRepository();
    repository.findAll = jest.fn().mockResolvedValue([]);

    await expect(repository.getOrderStartNotificationMinutes()).resolves.toBe(0);
  });
});

describe("AppSettingRepository order alert interval minutes", () => {
  it("returns configured alert intervals from the first app setting", async () => {
    const repository = new AppSettingRepository();
    repository.findAll = jest.fn().mockResolvedValue([
      {
        order: {
          urgentOrderAlertIntervalMinutes: 15,
          regularOrderAlertIntervalMinutes: 30,
        },
      },
    ] as any);

    await expect(repository.getUrgentOrderAlertIntervalMinutes()).resolves.toBe(15);
    await expect(repository.getRegularOrderAlertIntervalMinutes()).resolves.toBe(30);
  });

  it("falls back to 0 when alert intervals are missing", async () => {
    const repository = new AppSettingRepository();
    repository.findAll = jest.fn().mockResolvedValue([]);

    await expect(repository.getUrgentOrderAlertIntervalMinutes()).resolves.toBe(0);
    await expect(repository.getRegularOrderAlertIntervalMinutes()).resolves.toBe(0);
  });
});

describe("AppSettingRepository order pricing", () => {
  it("returns configured pricing values", async () => {
    const repository = new AppSettingRepository();
    repository.findAll = jest.fn().mockResolvedValue([{ order: {
      vat: 10,
      urgentOrderEnabled: true,
      urgentOrderHours: 2,
      urgentOrderSurchargePercent: 20,
      fragileItemSurchargePercent: 10,
    } }] as any);
    await expect(repository.getOrderPricingConfig()).resolves.toEqual({
      vat: 10,
      urgentOrderEnabled: true,
      urgentOrderHours: 2,
      urgentOrderSurchargePercent: 20,
      fragileItemSurchargePercent: 10,
    });
  });

  it("returns safe defaults without settings", async () => {
    const repository = new AppSettingRepository();
    repository.findAll = jest.fn().mockResolvedValue([]);
    await expect(repository.getOrderPricingConfig()).resolves.toEqual({
      vat: 0,
      urgentOrderEnabled: false,
      urgentOrderHours: 0,
      urgentOrderSurchargePercent: 0,
      fragileItemSurchargePercent: 0,
    });
  });

  it("returns the creator reward percent from accountantRevenueShare", async () => {
    const repository = new AppSettingRepository();
    repository.findAll = jest.fn().mockResolvedValue([
      { order: { accountantRevenueShare: 7 } },
    ] as any);

    await expect(repository.getCreatedByEmployeePercent()).resolves.toBe(7);
  });

  it("falls back to 0 when the creator reward setting is missing", async () => {
    const repository = new AppSettingRepository();
    repository.findAll = jest.fn().mockResolvedValue([]);

    await expect(repository.getCreatedByEmployeePercent()).resolves.toBe(0);
  });

  it("returns the branch manager revenue share setting", async () => {
    const repository = new AppSettingRepository();
    repository.findAll = jest.fn().mockResolvedValue([
      { order: { branchManagerRevenueShare: 12 } },
    ] as any);

    await expect(repository.getBranchManagerRevenueShare()).resolves.toBe(12);
  });

  it("falls back to 0 when the branch manager revenue share setting is missing", async () => {
    const repository = new AppSettingRepository();
    repository.findAll = jest.fn().mockResolvedValue([]);

    await expect(repository.getBranchManagerRevenueShare()).resolves.toBe(0);
  });
});
