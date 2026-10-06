import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: { get: jest.fn() },
}));

import { OrderController } from "../order.controller";
import { OrderService } from "../order.service";
import { OrderEmployeeController } from "../orderEmployee/orderEmployee.controller";
import { OrderEmployeeService } from "../orderEmployee/orderEmployee.service";
import { NotificationTypeEnum } from "@/shared/constants/constance";

describe("urgent order notifications", () => {
  it("notifies the order branch manager immediately when the order is urgent", async () => {
    const service = Object.create(OrderService.prototype) as any;
    const notificationService = {
      createNotificationForMultipleUsers: jest.fn().mockResolvedValue(undefined),
    };

    service.orderRepository = {
      findByOption: jest.fn().mockResolvedValue({
        id: "order-1",
        code: "HD0001",
        branchManagerId: "branch-manager-1",
        isUrgent: true,
      }),
    };
    service.userRepository = {
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue(["manager-user-1"]),
    };
    service.notificationService = notificationService;

    await service.notifyUrgentOrderCreated("order-1");

    expect(service.orderRepository.findByOption).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "order-1", isUrgent: true } }),
    );
    expect(notificationService.createNotificationForMultipleUsers).toHaveBeenCalledWith(
      ["manager-user-1"],
      expect.objectContaining({
        title: "Yêu cầu xác nhận nhận đơn hàng",
        content: "Vui lòng vào xác nhận đồng ý hoặc từ chối nhận đơn hàng.",
        type: NotificationTypeEnum.ALERT,
        objectId: "order-1",
        metadata: expect.objectContaining({
          orderId: "order-1",
          orderCode: "HD0001",
          event: "URGENT_ORDER_CREATED",
        }),
      }),
      undefined,
      { orderCode: "HD0001" },
    );
  });

  it("does not notify the branch manager when the order is not urgent", async () => {
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      findByOption: jest.fn().mockResolvedValue(null),
    };
    service.userRepository = {
      findUserIdsByEmployeeIds: jest.fn(),
    };
    service.notificationService = {
      createNotificationForMultipleUsers: jest.fn(),
    };

    await service.notifyUrgentOrderCreated("order-1");

    expect(service.userRepository.findUserIdsByEmployeeIds).not.toHaveBeenCalled();
    expect(service.notificationService.createNotificationForMultipleUsers).not.toHaveBeenCalled();
  });

  it("notifies the newly assigned employee immediately when the order is urgent", async () => {
    const service = Object.create(OrderEmployeeService.prototype) as any;
    const notificationService = {
      createNotificationForMultipleUsers: jest.fn().mockResolvedValue(undefined),
    };

    service.orderRepository = {
      findByOption: jest.fn().mockResolvedValue({
        id: "order-1",
        code: "HD0001",
        isUrgent: true,
      }),
    };
    service.orderEmployeeRepository = {
      findByOption: jest.fn().mockResolvedValue({
        id: "order-employee-1",
        orderId: "order-1",
        employeeId: "employee-1",
      }),
    };
    service.userRepository = {
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue(["employee-user-1"]),
    };
    service.notificationService = notificationService;

    await service.notifyUrgentOrderEmployeeAdded("order-1", "order-employee-1");

    expect(notificationService.createNotificationForMultipleUsers).toHaveBeenCalledWith(
      ["employee-user-1"],
      expect.objectContaining({
        title: "Yêu cầu xác nhận tham gia hợp đồng",
        content: "Vui lòng nhanh chóng vào xác nhận đồng ý hoặc từ chối tham gia hợp đồng.",
        type: NotificationTypeEnum.ALERT,
        objectId: "order-1",
        metadata: expect.objectContaining({
          orderId: "order-1",
          orderCode: "HD0001",
          event: "URGENT_ORDER_EMPLOYEE_ASSIGNED",
        }),
      }),
      undefined,
      { orderCode: "HD0001" },
    );
  });

  it("runs both creation notifications after their transactions commit", async () => {
    let orderCommitted = false;
    const orderResult = {
      statusCode: 201,
      data: { id: "order-1", isUrgent: true },
    };
    const orderService = {
      create: jest.fn().mockResolvedValue(orderResult),
      notifyOrderCreatedViaZalo: jest.fn().mockResolvedValue(undefined),
      notifyUrgentOrderCreated: jest.fn().mockImplementation(async () => {
        expect(orderCommitted).toBe(true);
      }),
    } as any;
    const orderTransactionManager = {
      withTransaction: jest.fn().mockImplementation(async (callback) => {
        const result = await callback({ manager: {} });
        orderCommitted = true;
        return result;
      }),
    } as any;
    const orderResponse = { status: jest.fn(), json: jest.fn() } as any;
    orderResponse.status.mockReturnValue(orderResponse);
    const orderController = new OrderController(orderService, orderTransactionManager, {} as any);

    await orderController.create({ body: {} } as any, orderResponse, jest.fn());

    expect(orderService.notifyUrgentOrderCreated).toHaveBeenCalledWith("order-1");

    let employeeCommitted = false;
    const employeeResult = {
      statusCode: 201,
      data: { id: "order-employee-1", orderId: "order-1" },
    };
    const employeeService = {
      create: jest.fn().mockResolvedValue(employeeResult),
      notifyUrgentOrderEmployeeAdded: jest.fn().mockImplementation(async () => {
        expect(employeeCommitted).toBe(true);
      }),
    } as any;
    const employeeTransactionManager = {
      withTransaction: jest.fn().mockImplementation(async (callback) => {
        const result = await callback({ manager: {} });
        employeeCommitted = true;
        return result;
      }),
    } as any;
    const employeeResponse = { status: jest.fn(), json: jest.fn() } as any;
    employeeResponse.status.mockReturnValue(employeeResponse);
    const employeeController = new OrderEmployeeController(
      employeeService,
      employeeTransactionManager,
      { notifyOrderAssigned: jest.fn().mockResolvedValue(undefined) } as any,
    );

    await employeeController.create(
      { body: {} } as any,
      employeeResponse,
      jest.fn(),
    );

    expect(employeeService.notifyUrgentOrderEmployeeAdded).toHaveBeenCalledWith(
      "order-1",
      "order-employee-1",
    );
  });
});
