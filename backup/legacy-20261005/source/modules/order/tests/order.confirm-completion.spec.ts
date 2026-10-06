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

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: { get: jest.fn() },
}));

import { randomUUID } from "crypto";
import { OrderController } from "../order.controller";
import { OrderService } from "../order.service";
import { OrderStatusEnum } from "@/shared/constants/constance";

describe("OrderService.confirmOrderCompletion", () => {
  const createLockedOrderQuery = (order: Record<string, unknown>) => {
    const queryBuilder = {
      setLock: jest.fn(),
      where: jest.fn(),
      andWhere: jest.fn(),
      getOne: jest.fn().mockResolvedValue(order),
    };

    queryBuilder.setLock.mockReturnValue(queryBuilder);
    queryBuilder.where.mockReturnValue(queryBuilder);
    queryBuilder.andWhere.mockReturnValue(queryBuilder);

    return queryBuilder;
  };

  it("records the authenticated leader confirmation for an order being processed", async () => {
    const orderId = randomUUID();
    const employeeId = randomUUID();
    const update = jest.fn().mockResolvedValue(undefined);
    const queryBuilder = createLockedOrderQuery({
      id: orderId,
      status: OrderStatusEnum.PROCESSING,
      completedByEmployeeId: null,
      completedAt: null,
    });
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
        update,
      }),
    };
    service.orderEmployeeRepository = {
      findByOption: jest
        .fn()
        .mockResolvedValue({ id: randomUUID(), isLeader: true }),
      hasConfirmedEmployeesWithoutCheckout: jest.fn().mockResolvedValue(false),
    };

    const result = await service.confirmOrderCompletion(
      orderId,
      { user: { employeeId } },
      {},
    );

    expect(service.orderEmployeeRepository.findByOption).toHaveBeenCalledWith(
      { where: { orderId, employeeId, isLeader: true } },
      expect.anything(),
    );
    expect(update).toHaveBeenCalledWith(orderId, {
      completedByEmployeeId: employeeId,
      completedAt: expect.any(Date),
    });
    expect(result.data).toEqual({ isNewlyConfirmed: true });
  });

  it("rejects confirmation while a confirmed employee has not checked out", async () => {
    const orderId = randomUUID();
    const employeeId = randomUUID();
    const update = jest.fn().mockResolvedValue(undefined);
    const queryBuilder = createLockedOrderQuery({
      id: orderId,
      status: OrderStatusEnum.PROCESSING,
      completedByEmployeeId: null,
      completedAt: null,
    });
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
        update,
      }),
    };
    service.orderEmployeeRepository = {
      findByOption: jest.fn().mockResolvedValue({ id: randomUUID(), isLeader: true }),
      hasConfirmedEmployeesWithoutCheckout: jest.fn().mockResolvedValue(true),
    };

    await expect(
      service.confirmOrderCompletion(orderId, { user: { employeeId } }, {}),
    ).rejects.toThrow(
      "Tất cả nhân viên đã xác nhận tham gia hợp đồng phải checkout trước khi xác nhận hoàn thành",
    );
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects an employee who is not a leader of the order", async () => {
    const orderId = randomUUID();
    const employeeId = randomUUID();
    const queryBuilder = createLockedOrderQuery({
      id: orderId,
      status: OrderStatusEnum.PROCESSING,
      completedByEmployeeId: null,
      completedAt: null,
    });
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      }),
    };
    service.orderEmployeeRepository = {
      findByOption: jest.fn().mockResolvedValue(null),
    };

    await expect(
      service.confirmOrderCompletion(orderId, { user: { employeeId } }, {}),
    ).rejects.toThrow(
      "Chỉ nhân viên đầu cánh của hợp đồng mới có thể xác nhận hoàn thành",
    );
  });

  it("rejects confirmation when the order is not being processed", async () => {
    const orderId = randomUUID();
    const employeeId = randomUUID();
    const queryBuilder = createLockedOrderQuery({
      id: orderId,
      status: OrderStatusEnum.PENDING,
      completedByEmployeeId: null,
      completedAt: null,
    });
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      }),
    };
    service.orderEmployeeRepository = { findByOption: jest.fn() };

    await expect(
      service.confirmOrderCompletion(orderId, { user: { employeeId } }, {}),
    ).rejects.toThrow("Chỉ có thể xác nhận hoàn thành khi đơn đang thực hiện");
    expect(service.orderEmployeeRepository.findByOption).not.toHaveBeenCalled();
  });

  it("notifies every admin, order leader, and order creator with a user account exactly once", async () => {
    const orderId = randomUUID();
    const adminUserId = randomUUID();
    const leaderEmployeeId = randomUUID();
    const leaderUserId = randomUUID();
    const creatorEmployeeId = randomUUID();
    const creatorUserId = randomUUID();
    const findUsers = jest
      .fn()
      .mockResolvedValueOnce([{ id: adminUserId }])
      .mockResolvedValueOnce([{ id: adminUserId }, { id: leaderUserId }, { id: creatorUserId }]);
    const notificationService = {
      createNotificationForMultipleUsers: jest
        .fn()
        .mockResolvedValue(undefined),
    };
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      findByOption: jest
        .fn()
        .mockResolvedValue({
          id: orderId,
          code: "HD0001",
          createdByEmployeeId: creatorEmployeeId,
        }),
    };
    service.orderLeaderRepository = {
      findByOptions: jest
        .fn()
        .mockResolvedValue([{ employeeId: leaderEmployeeId }]),
    };
    service.userRepository = {
      getRepository: jest.fn().mockReturnValue({ find: findUsers }),
    };
    service.notificationService = notificationService;

    await service.notifyOrderCompletionConfirmed(orderId);

    expect(findUsers.mock.calls[1][0].where.employeeId._value).toEqual(
      expect.arrayContaining([leaderEmployeeId, creatorEmployeeId]),
    );
    expect(
      notificationService.createNotificationForMultipleUsers,
    ).toHaveBeenCalledWith(
      [adminUserId, leaderUserId, creatorUserId],
      expect.objectContaining({
        title: "Đơn hoàn thành chờ duyệt",
        content: "Thông báo! Đơn hàng đã hoàn thành và đang chờ quản lý duyệt.",
        objectId: orderId,
      }),
      undefined,
      { orderCode: "HD0001" },
    );
  });
});

describe("OrderController.confirmOrderCompletion", () => {
  it("notifies only after the confirmation transaction commits", async () => {
    let committed = false;
    const result = {
      statusCode: 201,
      success: true,
      message: "OK",
      data: { isNewlyConfirmed: true },
    };
    const service = {
      confirmOrderCompletion: jest.fn().mockResolvedValue(result),
      notifyOrderCompletionConfirmed: jest.fn().mockImplementation(async () => {
        expect(committed).toBe(true);
      }),
    } as any;
    const transactionManager = {
      withTransaction: jest.fn().mockImplementation(async (callback) => {
        const transactionResult = await callback({ manager: {} });
        committed = true;
        return transactionResult;
      }),
    } as any;
    const response = {
      status: jest.fn(),
      json: jest.fn(),
    };
    response.status.mockReturnValue(response);
    const controller = new OrderController(
      service,
      transactionManager,
      {} as any,
    );

    await controller.confirmOrderCompletion(
      { params: { id: "order-1" } } as any,
      response as any,
      jest.fn(),
    );

    expect(service.notifyOrderCompletionConfirmed).toHaveBeenCalledWith(
      "order-1",
    );
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(result);
  });
});
