import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock("@/shared/utils/firebase/firebase.utils", () => ({
  __esModule: true,
  FirebaseUtils: {
    SentFirebaseWithUser: jest.fn(),
    SentFirebaseWithToken: jest.fn(),
    SentFirebaseWithTopic: jest.fn(),
  },
}));

import { randomUUID } from "crypto";
import { OrderService } from "../order.service";
import {
  BranchManagerConfirmStatusEnum,
  UserRoleEnum,
} from "@/shared/constants/constance";

const createLockedOrderQuery = (order: Record<string, unknown>) => {
  const queryBuilder = {
    select: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    setLock: jest.fn(),
    getOne: jest.fn().mockResolvedValue(order),
  };

  queryBuilder.select.mockReturnValue(queryBuilder);
  queryBuilder.where.mockReturnValue(queryBuilder);
  queryBuilder.andWhere.mockReturnValue(queryBuilder);
  queryBuilder.setLock.mockReturnValue(queryBuilder);

  return queryBuilder;
};

describe("OrderService branch manager confirmation", () => {
  it("allows the assigned branch manager to confirm and records the confirmation time", async () => {
    const orderId = randomUUID();
    const managerEmployeeId = randomUUID();
    const update = jest.fn().mockResolvedValue(undefined);
    const queryBuilder = createLockedOrderQuery({
      id: orderId,
      branchManagerId: managerEmployeeId,
      branchManagerConfirmedStatus: BranchManagerConfirmStatusEnum.PENDING,
      branchManagerConfirmedAt: null,
    });
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
        update,
      }),
    };

    const result = await service.confirmBranchManager(
      orderId,
      { user: { role: UserRoleEnum.MANAGER, employeeId: managerEmployeeId } },
      {},
    );

    expect(update).toHaveBeenCalledWith(orderId, {
      branchManagerConfirmedStatus: BranchManagerConfirmStatusEnum.CONFIRMED,
      branchManagerConfirmedAt: expect.any(Date),
    });
    expect(queryBuilder.andWhere).not.toHaveBeenCalledWith('order."deletedAt" IS NULL');
    expect(result.data).toEqual({
      isNewlyUpdated: true,
      orderId,
      branchManagerConfirmedStatus: BranchManagerConfirmStatusEnum.CONFIRMED,
      branchManagerConfirmedAt: expect.any(Date),
    });
  });

  it("rejects a user who is not the assigned branch manager", async () => {
    const orderId = randomUUID();
    const assignedManagerId = randomUUID();
    const otherEmployeeId = randomUUID();
    const update = jest.fn();
    const queryBuilder = createLockedOrderQuery({
      id: orderId,
      branchManagerId: assignedManagerId,
      branchManagerConfirmedStatus: BranchManagerConfirmStatusEnum.PENDING,
      branchManagerConfirmedAt: null,
    });
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
        update,
      }),
    };

    await expect(
      service.rejectBranchManager(
        orderId,
        { user: { role: UserRoleEnum.MANAGER, employeeId: otherEmployeeId } },
        {},
      ),
    ).rejects.toThrow("Chỉ quản lý chi nhánh của hợp đồng mới có thể phản hồi nhận đơn");
    expect(update).not.toHaveBeenCalled();
  });

  it("does not notify again when the requested status is already current", async () => {
    const orderId = randomUUID();
    const managerEmployeeId = randomUUID();
    const update = jest.fn();
    const queryBuilder = createLockedOrderQuery({
      id: orderId,
      branchManagerId: managerEmployeeId,
      branchManagerConfirmedStatus: BranchManagerConfirmStatusEnum.CONFIRMED,
      branchManagerConfirmedAt: new Date("2026-09-07T08:00:00.000Z"),
    });
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
        update,
      }),
    };

    const result = await service.confirmBranchManager(
      orderId,
      { user: { role: UserRoleEnum.MANAGER, employeeId: managerEmployeeId } },
      {},
    );

    expect(update).not.toHaveBeenCalled();
    expect(result.data).toMatchObject({
      isNewlyUpdated: false,
      branchManagerConfirmedStatus: BranchManagerConfirmStatusEnum.CONFIRMED,
    });
  });
});

describe("OrderService.notifyBranchManagerConfirmationStatus", () => {
  it("notifies every admin and the order creator exactly once", async () => {
    const orderId = randomUUID();
    const creatorEmployeeId = randomUUID();
    const adminUserId = randomUUID();
    const creatorUserId = randomUUID();
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      findByOption: jest.fn().mockResolvedValue({
        id: orderId,
        code: "HD0001",
        createdByEmployeeId: creatorEmployeeId,
      }),
    };
    service.userRepository = {
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn().mockResolvedValue([{ id: adminUserId }]),
      }),
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue([creatorUserId]),
    };
    service.notificationService = {
      createNotificationForMultipleUsers: jest.fn().mockResolvedValue(undefined),
    };

    await service.notifyBranchManagerConfirmationStatus(
      orderId,
      BranchManagerConfirmStatusEnum.REJECTED,
    );

    expect(
      service.notificationService.createNotificationForMultipleUsers,
    ).toHaveBeenCalledWith(
      [adminUserId, creatorUserId],
      expect.objectContaining({
        title: "Quản lý chi nhánh từ chối nhận đơn",
        objectId: orderId,
        metadata: expect.objectContaining({
          orderId,
          orderCode: "HD0001",
          status: BranchManagerConfirmStatusEnum.REJECTED,
        }),
      }),
      undefined,
      { orderCode: "HD0001" },
    );
  });
});
