import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/shared/utils/firebase/firebase.utils", () => ({
  __esModule: true,
  FirebaseUtils: {
    SentFirebaseWithUser: jest.fn(),
    SentFirebaseWithToken: jest.fn(),
    SentFirebaseWithTopic: jest.fn(),
  },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: {
    get: jest.fn(),
  },
}));

import fs from "node:fs";
import path from "node:path";

import { ServiceOrder } from "@/database/models/ServiceOrder";
import { getMetadataArgsStorage } from "typeorm";

import { AdminServiceOrderService } from "../admin.serviceOrder.service";
import { ServiceOrderSelectBasic } from "../serviceOrder.select";

describe("ServiceOrder start notification sent-marker persistence contract", () => {
  it("persists the sent-marker on the model/select contract and guards the migration for drifted databases", () => {
    const serviceOrderColumns = getMetadataArgsStorage()
      .columns.filter((column) => column.target === ServiceOrder)
      .map((column) => column.propertyName);
    const migrationSource = fs.readFileSync(
      path.resolve(
        __dirname,
        "../../../database/migrations/1777300000000-AddOrderStartNotificationSentAtToServiceOrders.ts",
      ),
      "utf8",
    );

    expect(serviceOrderColumns).toContain("orderStartNotificationSentAt");
    expect(ServiceOrderSelectBasic).toMatchObject({
      timeAt: true,
      orderStartNotificationSentAt: true,
    });
    expect(migrationSource).toContain('ADD COLUMN IF NOT EXISTS "orderStartNotificationSentAt"');
    expect(migrationSource).toContain('DROP COLUMN IF EXISTS "orderStartNotificationSentAt"');
  });
});

describe("AdminServiceOrderService.update", () => {
  const createService = (current: Partial<ServiceOrder>) => {
    const serviceOrderRepository = {
      findById: jest.fn().mockResolvedValue(current),
      update: jest.fn().mockResolvedValue({ id: current.id }),
      setOptions: jest.fn(),
    };

    const service = new AdminServiceOrderService(
      serviceOrderRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    const serviceAny = service as any;
    serviceAny.checkReferencesInDb = jest.fn().mockResolvedValue([]);
    serviceAny.actionAfterUpdate = jest.fn().mockResolvedValue(undefined);

    return {
      service,
      serviceOrderRepository,
    };
  };

  it("passes orderStartNotificationSentAt: null to repository.update when admin changes timeAt", async () => {
    const currentTimeAt = new Date("2026-06-16T08:00:00.000Z");
    const { service, serviceOrderRepository } = createService({
      id: "service-order-1",
      timeAt: currentTimeAt,
      orderStartNotificationSentAt: new Date("2026-06-16T07:00:00.000Z"),
    });
    const data: Partial<ServiceOrder> = {
      timeAt: new Date("2026-06-16T09:00:00.000Z"),
      orderStartNotificationSentAt: new Date("2026-06-16T07:30:00.000Z"),
    };

    await service.update("service-order-1", data);

    expect(serviceOrderRepository.update).toHaveBeenCalledWith(
      "service-order-1",
      expect.objectContaining({
        timeAt: data.timeAt,
        orderStartNotificationSentAt: null,
      }),
      undefined,
    );
  });

  it("keeps the sent-marker in repository.update payload when timeAt stays the same instant", async () => {
    const currentTimeAt = new Date("2026-06-16T08:00:00.000Z");
    const existingSentAt = new Date("2026-06-16T07:30:00.000Z");
    const { service, serviceOrderRepository } = createService({
      id: "service-order-1",
      timeAt: currentTimeAt,
      orderStartNotificationSentAt: existingSentAt,
    });
    const data: Partial<ServiceOrder> = {
      timeAt: new Date("2026-06-16T08:00:00.000Z"),
      orderStartNotificationSentAt: existingSentAt,
    };

    await service.update("service-order-1", data);

    expect(serviceOrderRepository.update).toHaveBeenCalledWith(
      "service-order-1",
      expect.objectContaining({
        timeAt: data.timeAt,
        orderStartNotificationSentAt: existingSentAt,
      }),
      undefined,
    );
  });
});

describe("AdminServiceOrderService.submitQuote", () => {
  it("keeps the existing address coordinates when sending the quote", async () => {
    const address = {
      detail: "Số 1 Trần Duy Hưng",
      latitude: 21.0075,
      longitude: 105.8014,
    };
    const current = {
      id: "service-order-1",
      customerId: "customer-1",
      status: "WAITING_FOR_QUOTE",
      quote: [{ key: "Nhân công", value: 1_000_000, code: null, type: "inc" }],
      address,
    } as ServiceOrder;
    const manager = {};
    const transactionManager = {
      withTransactionCallback: jest.fn().mockImplementation(async (callback) => callback(manager)),
    };
    const serviceOrderRepository = {
      findById: jest.fn().mockResolvedValue(current),
      setOptions: jest.fn(),
    };
    const userRepository = {
      findUserIdByCustomerId: jest.fn().mockResolvedValue(null),
    };
    const service = new AdminServiceOrderService(
      serviceOrderRepository as any,
      transactionManager as any,
      {} as any,
      {} as any,
      userRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
    const updateResult = { data: current } as any;
    const updateSpy = jest.spyOn(service, "update").mockResolvedValue(updateResult);

    await service.submitQuote(current.id);

    expect(updateSpy).toHaveBeenCalledWith(
      current.id,
      {
        status: "WAITING_FOR_CUSTOMER_CONFIRMATION",
        address,
      },
      undefined,
      manager,
    );
  });
});

describe("AdminServiceOrderService.delete", () => {
  it("clears ticket references before deleting the service order", async () => {
    const ticketRepository = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const manager = {
      getRepository: jest.fn().mockReturnValue(ticketRepository),
    };
    const transactionManager = {
      withTransactionCallback: jest.fn().mockImplementation(async (callback) => callback(manager)),
    };
    const serviceOrderRepository = {
      findById: jest.fn().mockResolvedValue({ id: "service-order-1" }),
      delete: jest.fn().mockResolvedValue(true),
      setOptions: jest.fn(),
    };

    const service = new AdminServiceOrderService(
      serviceOrderRepository as any,
      transactionManager as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.delete("service-order-1");

    expect(ticketRepository.update).toHaveBeenCalledWith(
      { serviceOrderId: "service-order-1" },
      { serviceOrderId: null },
    );
    expect(serviceOrderRepository.delete).toHaveBeenCalledWith("service-order-1", manager, undefined);
  });
});
