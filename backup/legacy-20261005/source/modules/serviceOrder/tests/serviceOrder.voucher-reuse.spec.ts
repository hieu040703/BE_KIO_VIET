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
import { ServiceOrderStatusEnum } from "@/shared/constants/constance";
import { getMetadataArgsStorage } from "typeorm";

import { AdminServiceOrderService } from "../admin.serviceOrder.service";
import { ClientServiceOrderService } from "../client.serviceOrder.service";

describe("ServiceOrder voucher reuse contract", () => {
  it("keeps the relation non-unique in code and removes the legacy DB unique constraint in migration", () => {
    const vouchersRelation = getMetadataArgsStorage().relations.find(
      (relation) => relation.target === ServiceOrder && relation.propertyName === "vouchers",
    );
    const migrationSource = fs.readFileSync(
      path.resolve(
        __dirname,
        "../../../database/migrations/1777800000000-DropServiceOrdersVouchersIdUniqueConstraint.ts",
      ),
      "utf8",
    );

    expect(vouchersRelation?.relationType).toBe("many-to-one");
    expect(migrationSource).toContain('DROP CONSTRAINT "UQ_ea0813fe0e0e491e45482a69547"');
    expect(migrationSource).toContain('ADD CONSTRAINT "UQ_ea0813fe0e0e491e45482a69547" UNIQUE ("vouchersId")');
  });
});

describe("AdminServiceOrderService.update", () => {
  const createService = (current: Partial<ServiceOrder>) => {
    const serviceOrderRepository = {
      findById: jest.fn().mockResolvedValue(current),
      update: jest.fn().mockResolvedValue({ id: current.id, ...current }),
      setOptions: jest.fn(),
    };
    const serviceOrderChatService = {
      createStatusChangedSystemMessage: jest.fn().mockResolvedValue(undefined),
    };
    const goongMapService = {
      stopServiceOrderTracking: jest.fn().mockResolvedValue(undefined),
    };
    const vouchersRepository = {
      update: jest.fn().mockResolvedValue(undefined),
    };

    const service = new AdminServiceOrderService(
      serviceOrderRepository as any,
      {} as any,
      {} as any,
      serviceOrderChatService as any,
      {} as any,
      {} as any,
      goongMapService as any,
      {} as any,
      {} as any,
      vouchersRepository as any,
      {} as any,
    );

    const serviceAny = service as any;
    serviceAny.checkReferencesInDb = jest.fn().mockResolvedValue([]);
    serviceAny.actionAfterUpdate = jest.fn().mockResolvedValue(undefined);

    return {
      service,
      serviceOrderRepository,
      vouchersRepository,
    };
  };

  it("nulls vouchersId on the canceled order before releasing the voucher", async () => {
    const { service, serviceOrderRepository, vouchersRepository } = createService({
      id: "service-order-1",
      customerId: "customer-1",
      status: ServiceOrderStatusEnum.WAITING_FOR_QUOTE,
      vouchersId: "voucher-1",
    });

    await service.update(
      "service-order-1",
      { status: ServiceOrderStatusEnum.CANCELED },
      { skipTrackingLifecycle: true } as any,
    );

    expect(serviceOrderRepository.update).toHaveBeenCalledWith(
      "service-order-1",
      expect.objectContaining({
        status: ServiceOrderStatusEnum.CANCELED,
        vouchersId: null,
      }),
      undefined,
    );
    expect(vouchersRepository.update).toHaveBeenCalledWith(
      "voucher-1",
      { isUsed: false, usedAt: null },
      undefined,
    );
  });
});

describe("ClientServiceOrderService.cancelOrder", () => {
  const createService = (current: Partial<ServiceOrder>) => {
    const serviceOrderRepository = {
      findById: jest.fn().mockResolvedValue(current),
      update: jest.fn().mockResolvedValue({ id: current.id, ...current }),
      setOptions: jest.fn(),
    };
    const serviceOrderChatService = {
      createSystemMessage: jest.fn().mockResolvedValue(undefined),
    };
    const vouchersRepository = {
      update: jest.fn().mockResolvedValue(undefined),
    };

    const service = new ClientServiceOrderService(
      serviceOrderRepository as any,
      {} as any,
      {} as any,
      {} as any,
      serviceOrderChatService as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      vouchersRepository as any,
      {} as any,
      {} as any,
    );

    const serviceAny = service as any;
    serviceAny.checkReferencesInDb = jest.fn().mockResolvedValue([]);
    serviceAny.actionAfterUpdate = jest.fn().mockResolvedValue(undefined);

    return {
      service,
      serviceOrderRepository,
      vouchersRepository,
    };
  };

  it("clears vouchersId on cancel so the voucher can be reused on a new order", async () => {
    const { service, serviceOrderRepository, vouchersRepository } = createService({
      id: "service-order-1",
      customerId: "customer-1",
      status: ServiceOrderStatusEnum.WAITING_FOR_QUOTE,
      vouchersId: "voucher-1",
    });

    await service.cancelOrder(
      "service-order-1",
      {
        user: {
          customerId: "customer-1",
        },
      } as any,
    );

    expect(serviceOrderRepository.update).toHaveBeenCalledWith(
      "service-order-1",
      expect.objectContaining({
        status: ServiceOrderStatusEnum.CANCELED,
        vouchersId: null,
      }),
      undefined,
    );
    expect(vouchersRepository.update).toHaveBeenCalledWith(
      "voucher-1",
      { isUsed: false, usedAt: null },
      undefined,
    );
  });
});
