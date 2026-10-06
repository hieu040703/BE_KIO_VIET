import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

import { AdminServiceService } from "../admin.service.service";

describe("AdminServiceService service price mapping", () => {
  it("passes unit, quantity, and excessUnitPrice when creating service prices", async () => {
    const serviceRepository = {
      create: jest.fn().mockResolvedValue({ id: "service-1" }),
      findById: jest.fn().mockResolvedValue({ id: "service-1", name: "Boc xep theo ca" }),
      setOptions: jest.fn(),
    } as any;

    const servicePriceRepository = {
      create: jest.fn().mockResolvedValue({}),
    } as any;

    const transactionManager = {
      withTransactionCallback: jest.fn().mockImplementation(async (callback) => callback({})),
    } as any;

    const service = new AdminServiceService(serviceRepository, transactionManager, servicePriceRepository);

    await service.create({
      name: "Boc xep theo ca",
      type: "BOC_XEP_THEO_CA" as any,
      prices: [
        {
          category: "Nhan cong",
          unit: "gio",
          quantity: 8,
          price: 500000,
          excessUnitPrice: 70000,
          note: "Ca ngay",
        },
      ],
    } as any);

    expect(servicePriceRepository.create).toHaveBeenCalledWith(
      {
        serviceId: "service-1",
        category: "Nhan cong",
        unit: "gio",
        quantity: 8,
        price: 500000,
        excessUnitPrice: 70000,
        note: "Ca ngay",
      },
      {},
    );
  });
});
