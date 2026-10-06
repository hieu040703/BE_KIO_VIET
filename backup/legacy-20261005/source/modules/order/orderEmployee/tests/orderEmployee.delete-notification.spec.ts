import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: { get: jest.fn() },
}));

import { NotificationTypeEnum } from "@/shared/constants/constance";
import { OrderEmployeeController } from "../orderEmployee.controller";
import { OrderEmployeeService } from "../orderEmployee.service";

describe("OrderEmployee removal notification", () => {
  it("notifies the removed employee's user", async () => {
    const service = Object.create(OrderEmployeeService.prototype) as any;
    const notificationService = {
      createNotificationForMultipleUsers: jest.fn().mockResolvedValue(undefined),
    };

    service.orderRepository = {
      findByOption: jest.fn().mockResolvedValue({
        id: "order-1",
        code: "HD0001",
      }),
    };
    service.userRepository = {
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue(["employee-user-1"]),
    };
    service.notificationService = notificationService;

    await service.notifyOrderEmployeeRemoved("order-1", "employee-1");

    expect(service.userRepository.findUserIdsByEmployeeIds).toHaveBeenCalledWith(["employee-1"]);
    expect(notificationService.createNotificationForMultipleUsers).toHaveBeenCalledWith(
      ["employee-user-1"],
      expect.objectContaining({
        title: "Bạn đã được xóa khỏi hợp đồng",
        content: "Bạn đã được xóa khỏi hợp đồng HD0001.",
        type: NotificationTypeEnum.ALERT,
        objectId: "order-1",
        metadata: {
          orderId: "order-1",
          orderCode: "HD0001",
          employeeId: "employee-1",
          event: "ORDER_EMPLOYEE_REMOVED",
        },
      }),
      undefined,
      { orderCode: "HD0001" },
    );
  });

  it("sends the removal notification only after the delete transaction commits", async () => {
    let committed = false;
    const manager = {};
    const req = { params: { id: "order-employee-1" } };
    const result = { statusCode: 200, data: "order-employee-1" };
    const service = {
      getDeleteMeta: jest.fn().mockResolvedValue({
        orderId: "order-1",
        employeeId: "employee-1",
      }),
      delete: jest.fn().mockResolvedValue(result),
      notifyOrderEmployeeRemoved: jest.fn().mockImplementation(async () => {
        expect(committed).toBe(true);
      }),
    } as any;
    const transactionManager = {
      withTransaction: jest.fn().mockImplementation(async (callback) => {
        const transactionResult = await callback({ manager });
        committed = true;
        return transactionResult;
      }),
    } as any;
    const response = { status: jest.fn(), json: jest.fn() } as any;
    response.status.mockReturnValue(response);
    const next = jest.fn();
    const controller = new OrderEmployeeController(service, transactionManager, {} as any);

    await controller.delete(req as any, response, next);

    expect(service.getDeleteMeta).toHaveBeenCalledWith("order-employee-1", manager);
    expect(service.delete).toHaveBeenCalledWith("order-employee-1", req, manager);
    expect(service.notifyOrderEmployeeRemoved).toHaveBeenCalledWith("order-1", "employee-1");
    expect(response.json).toHaveBeenCalledWith(result);
    expect(next).not.toHaveBeenCalled();
  });
});
