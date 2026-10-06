import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: { get: jest.fn() },
}));

import {
  BranchManagerConfirmStatusEnum,
  NotificationTypeEnum,
  OrderEmployeeStatusEnum,
} from "@/shared/constants/constance";
import { OrderController } from "../order.controller";
import { OrderService } from "../order.service";

describe("OrderService time change notification", () => {
  it("notifies all users linked to active order employees", async () => {
    const order = {
      id: "order-1",
      code: "HD0001",
      timeAt: new Date("2026-09-12T03:00:00.000Z"),
      branchManagerId: "manager-employee-1",
    };
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(order),
      }),
    };
    service.orderEmployeeRepository = {
      getAllUsersByOrderId: jest.fn().mockResolvedValue([{ id: "employee-user-1" }, { id: "employee-user-2" }]),
    };
    service.userRepository = {
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue(["manager-user-1"]),
    };
    service.notificationService = {
      createNotificationForMultipleUsers: jest.fn().mockResolvedValue(undefined),
    };

    await service.notifyOrderTimeAtChanged("order-1");

    expect(service.orderEmployeeRepository.getAllUsersByOrderId).toHaveBeenCalledWith("order-1");
    expect(service.userRepository.findUserIdsByEmployeeIds).toHaveBeenCalledWith(["manager-employee-1"]);
    expect(service.notificationService.createNotificationForMultipleUsers).toHaveBeenCalledWith(
      ["employee-user-1", "employee-user-2", "manager-user-1"],
      expect.objectContaining({
        title: "Thời gian bắt đầu hợp đồng thay đổi",
        content: expect.stringMatching(/HD0001.*xác nhận lại đơn hàng/),
        type: NotificationTypeEnum.ALERT,
        objectId: "order-1",
        metadata: expect.objectContaining({
          orderId: "order-1",
          orderCode: "HD0001",
          event: "ORDER_TIME_AT_UPDATED",
          timeAt: order.timeAt.toISOString(),
        }),
      }),
      undefined,
      { orderCode: "HD0001" },
    );
  });

  it("skips notification when no assigned employee has a user account", async () => {
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue({ id: "order-1", code: "HD0001", timeAt: new Date() }),
      }),
    };
    service.orderEmployeeRepository = {
      getAllUsersByOrderId: jest.fn().mockResolvedValue([]),
    };
    service.userRepository = {
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue([]),
    };
    service.notificationService = {
      createNotificationForMultipleUsers: jest.fn(),
    };

    await service.notifyOrderTimeAtChanged("order-1");

    expect(service.notificationService.createNotificationForMultipleUsers).not.toHaveBeenCalled();
  });
});

describe("OrderService confirmation reset after time change", () => {
  it("resets the branch manager and active employees to pending confirmation", async () => {
    const branchManagerRepository = { update: jest.fn().mockResolvedValue(undefined) };
    const orderEmployeeRepository = { update: jest.fn().mockResolvedValue(undefined) };
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      getRepository: jest.fn().mockReturnValue(branchManagerRepository),
    };
    service.orderEmployeeRepository = {
      getRepository: jest.fn().mockReturnValue(orderEmployeeRepository),
    };
    service.orderCommentService = { create: jest.fn().mockResolvedValue(undefined) };
    service.calculateOrderData = { process: jest.fn().mockResolvedValue(undefined) };

    const req = {
      body: { timeAt: new Date("2026-09-12T04:00:00.000Z") },
      existingOrder: { id: "order-1", timeAt: new Date("2026-09-12T03:00:00.000Z") },
    } as any;

    await service.actionAfterUpdate(
      { id: "order-1", timeAt: new Date("2026-09-12T04:00:00.000Z") },
      req,
    );

    expect(branchManagerRepository.update).toHaveBeenCalledWith("order-1", {
      branchManagerConfirmedStatus: BranchManagerConfirmStatusEnum.PENDING,
      branchManagerConfirmedAt: null,
    });
    expect(orderEmployeeRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: "order-1", deletedAt: expect.any(Object) }),
      { status: OrderEmployeeStatusEnum.PENDING },
    );
  });

  it("does not reset confirmations when timeAt has the same timestamp", async () => {
    const branchManagerRepository = { update: jest.fn().mockResolvedValue(undefined) };
    const orderEmployeeRepository = { update: jest.fn().mockResolvedValue(undefined) };
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      getRepository: jest.fn().mockReturnValue(branchManagerRepository),
    };
    service.orderEmployeeRepository = {
      getRepository: jest.fn().mockReturnValue(orderEmployeeRepository),
    };
    service.orderCommentService = { create: jest.fn().mockResolvedValue(undefined) };
    service.calculateOrderData = { process: jest.fn().mockResolvedValue(undefined) };

    const sameTime = new Date("2026-09-12T03:00:00.000Z");
    await service.actionAfterUpdate(
      { id: "order-1", timeAt: new Date(sameTime) },
      {
        body: { timeAt: sameTime.toISOString() },
        existingOrder: { id: "order-1", timeAt: sameTime },
      } as any,
    );

    expect(branchManagerRepository.update).not.toHaveBeenCalled();
    expect(orderEmployeeRepository.update).not.toHaveBeenCalled();
  });
});

describe("OrderController.update time change side effect", () => {
  it("starts the notification only after a successful time change", async () => {
    const service = {
      update: jest.fn().mockImplementation(async (_id, _body, req) => {
        req.existingOrder = { timeAt: new Date("2026-09-11T03:00:00.000Z") };
        return {
          statusCode: 200,
          data: { id: "order-1", timeAt: new Date("2026-09-12T03:00:00.000Z") },
        };
      }),
      notifyOrderTimeAtChanged: jest.fn().mockResolvedValue(undefined),
    } as any;
    const controller = new OrderController(service, {} as any, {} as any);
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    await controller.update(
      {
        params: { id: "order-1" },
        body: { timeAt: "2026-09-12T03:00:00.000Z" },
      } as any,
      response,
      jest.fn(),
    );

    expect(service.notifyOrderTimeAtChanged).toHaveBeenCalledWith("order-1");
    expect(response.json).toHaveBeenCalled();
  });

  it("does not notify when the submitted time is unchanged", async () => {
    const sameTime = "2026-09-11T03:00:00.000Z";
    const service = {
      update: jest.fn().mockImplementation(async (_id, _body, req) => {
        req.existingOrder = { timeAt: new Date(sameTime) };
        return {
          statusCode: 200,
          data: { id: "order-1", timeAt: new Date(sameTime) },
        };
      }),
      notifyOrderTimeAtChanged: jest.fn().mockResolvedValue(undefined),
    } as any;
    const controller = new OrderController(service, {} as any, {} as any);
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    await controller.update(
      {
        params: { id: "order-1" },
        body: { timeAt: sameTime },
      } as any,
      response,
      jest.fn(),
    );

    expect(service.notifyOrderTimeAtChanged).not.toHaveBeenCalled();
  });
});
