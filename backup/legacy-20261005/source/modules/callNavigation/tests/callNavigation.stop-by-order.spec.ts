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

import { CallNavigationService } from "../callNavigation.service";

describe("CallNavigationService.stopCallNavigationByOrder", () => {
  it("updates all call navigations with the transaction manager", async () => {
    const manager = {} as any;
    const findByOptions = jest.fn().mockResolvedValue([{ id: "navigation-1" }, { id: "navigation-2" }]);
    const updateMany = jest.fn().mockResolvedValue([]);
    const service = Object.create(CallNavigationService.prototype) as CallNavigationService;

    Object.assign(service as any, {
      callNavigationRepository: { findByOptions, updateMany },
    });

    await service.stopCallNavigationByOrder("order-1", manager);

    expect(findByOptions).toHaveBeenCalledWith({ where: { orderId: "order-1" } }, manager);
    expect(updateMany).toHaveBeenCalledWith(
      ["navigation-1", "navigation-2"],
      { expiresAt: expect.any(Date) },
      manager,
    );
  });
});
