import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: { get: jest.fn() },
}));

import { randomUUID } from "crypto";
import { OrderEmployeeService } from "../orderEmployee.service";

describe("OrderEmployeeService.checkIn", () => {
  it("stores the check-in data on the assigned employee row", async () => {
    const orderId = randomUUID();
    const employeeId = randomUUID();
    const orderEmployee = {
      id: randomUUID(),
      orderId,
      employeeId,
      checkInAt: null,
    };
    const updatedOrderEmployee = {
      ...orderEmployee,
      checkInAt: new Date(),
      checkInLatitude: 21.02917,
      checkInLongitude: 105.77728,
    };
    const repository = {
      findByOption: jest.fn().mockResolvedValue(orderEmployee),
      update: jest.fn().mockResolvedValue(updatedOrderEmployee),
    };
    const service = Object.create(OrderEmployeeService.prototype) as any;
    service.orderEmployeeRepository = repository;
    const manager = {};

    const result = await service.checkIn(
      orderId,
      employeeId,
      { latitude: 21.02917, longitude: 105.77728 },
      manager,
    );

    expect(result).toBe(updatedOrderEmployee);
    expect(repository.update).toHaveBeenCalledWith(
      orderEmployee.id,
      {
        checkInAt: expect.any(Date),
        checkInLatitude: 21.02917,
        checkInLongitude: 105.77728,
      },
      manager,
    );
  });

  it("rejects a second check-in for the same order and employee", async () => {
    const repository = {
      findByOption: jest.fn().mockResolvedValue({
        id: randomUUID(),
        checkInAt: new Date(),
      }),
      update: jest.fn(),
    };
    const service = Object.create(OrderEmployeeService.prototype) as any;
    service.orderEmployeeRepository = repository;

    await expect(service.checkIn(randomUUID(), randomUUID(), { latitude: 21, longitude: 105 })).rejects.toMatchObject({
      statusCode: 409,
      message: "Nhân viên đã checkin đơn hàng này",
    });
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("rejects check-in when the employee is not assigned to the order", async () => {
    const repository = {
      findByOption: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };
    const service = Object.create(OrderEmployeeService.prototype) as any;
    service.orderEmployeeRepository = repository;

    await expect(service.checkIn(randomUUID(), randomUUID(), { latitude: 21, longitude: 105 })).rejects.toMatchObject({
      statusCode: 400,
      message: "Nhân viên không thuộc hợp đồng",
    });
    expect(repository.update).not.toHaveBeenCalled();
  });

  it.each([
    ["notifyOrderEmployeeCheckIn", "ORDER_EMPLOYEE_CHECKED_IN", "Nhân viên đã check-in đơn hàng"],
    ["notifyOrderEmployeeCheckOut", "ORDER_EMPLOYEE_CHECKED_OUT", "Nhân viên đã checkout đơn hàng"],
  ])(
    "notifies the branch manager after %s",
    async (methodName, event, title) => {
      const orderId = randomUUID();
      const employeeId = randomUUID();
      const branchManagerEmployeeId = randomUUID();
      const branchManagerUserId = randomUUID();
      const service = Object.create(OrderEmployeeService.prototype) as any;
      service.orderRepository = {
        findByOption: jest.fn().mockResolvedValue({
          id: orderId,
          code: "HD0001",
          branchManagerId: branchManagerEmployeeId,
        }),
      };
      service.userRepository = {
        findUserIdsByEmployeeIds: jest.fn().mockResolvedValue([branchManagerUserId]),
      };
      service.employeeRepository = {
        findById: jest.fn().mockResolvedValue({ name: "Nguyễn Văn A" }),
      };
      service.notificationService = {
        createNotificationForMultipleUsers: jest.fn().mockResolvedValue(undefined),
      };

      await service[methodName](orderId, employeeId);

      expect(service.userRepository.findUserIdsByEmployeeIds).toHaveBeenCalledWith([
        branchManagerEmployeeId,
      ]);
      expect(service.notificationService.createNotificationForMultipleUsers).toHaveBeenCalledWith(
        [branchManagerUserId],
        {
          title,
          content: expect.stringContaining("Nguyễn Văn A"),
          type: "SYSTEM",
          objectId: orderId,
          metadata: {
            orderId,
            orderCode: "HD0001",
            employeeId,
            event,
          },
        },
        undefined,
        { orderCode: "HD0001" },
      );
    },
  );

  it("skips attendance notification when the branch manager has no user account", async () => {
    const service = Object.create(OrderEmployeeService.prototype) as any;
    service.orderRepository = {
      findByOption: jest.fn().mockResolvedValue({
        id: randomUUID(),
        code: "HD0001",
        branchManagerId: randomUUID(),
      }),
    };
    service.userRepository = {
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue([]),
    };
    service.employeeRepository = { findById: jest.fn() };
    service.notificationService = {
      createNotificationForMultipleUsers: jest.fn(),
    };

    await service.notifyOrderEmployeeCheckIn(randomUUID(), randomUUID());

    expect(service.employeeRepository.findById).not.toHaveBeenCalled();
    expect(service.notificationService.createNotificationForMultipleUsers).not.toHaveBeenCalled();
  });
});
