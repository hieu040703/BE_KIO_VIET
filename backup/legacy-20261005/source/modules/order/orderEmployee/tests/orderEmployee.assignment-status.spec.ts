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
import { OrderEmployeeController } from "../orderEmployee.controller";
import { OrderEmployeeService } from "../orderEmployee.service";
import {
  OrderEmployeeStatusEnum,
  UserRoleEnum,
} from "@/shared/constants/constance";

describe("OrderEmployeeService assignment status", () => {
  it("allows the assigned employee to confirm once while waiting", async () => {
    const orderId = randomUUID();
    const employeeId = randomUUID();
    const orderEmployee = {
      id: randomUUID(),
      orderId,
      employeeId,
      status: OrderEmployeeStatusEnum.PENDING,
    };
    const repository = {
      findByOption: jest.fn().mockResolvedValue(orderEmployee),
      findById: jest.fn().mockResolvedValue({
        ...orderEmployee,
        status: OrderEmployeeStatusEnum.CONFIRMED,
      }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const service = Object.create(OrderEmployeeService.prototype) as any;
    service.orderEmployeeRepository = repository;

    const result = await service.confirmAssignment(
      orderId,
      orderEmployee.id,
      { user: { employeeId } },
      {},
    );

    expect(repository.findByOption).toHaveBeenCalledWith(
      { where: { id: orderEmployee.id, orderId, employeeId } },
      expect.anything(),
    );
    expect(repository.update).toHaveBeenCalledWith(
      orderEmployee.id,
      { status: OrderEmployeeStatusEnum.CONFIRMED },
      expect.anything(),
    );
    expect(result.data?.isNewlyUpdated).toBe(true);
  });

  it("rejects self-confirmation when the employee is not assigned", async () => {
    const service = Object.create(OrderEmployeeService.prototype) as any;
    service.orderEmployeeRepository = {
      findByOption: jest.fn().mockResolvedValue(null),
    };

    await expect(
      service.confirmAssignment(
        randomUUID(),
        randomUUID(),
        { user: { employeeId: randomUUID() } },
        {},
      ),
    ).rejects.toThrow("Nhân viên không thuộc hợp đồng");
  });

  it("rejects a self response after the assignment was already answered", async () => {
    const service = Object.create(OrderEmployeeService.prototype) as any;
    service.orderEmployeeRepository = {
      findByOption: jest.fn().mockResolvedValue({
        id: randomUUID(),
        status: OrderEmployeeStatusEnum.CONFIRMED,
      }),
    };

    await expect(
      service.rejectAssignment(
        randomUUID(),
        randomUUID(),
        { user: { employeeId: randomUUID() } },
        {},
      ),
    ).rejects.toThrow("Nhân viên đã phản hồi việc thực hiện hợp đồng");
  });

  it("allows admins and assigned order leaders to set an employee status", async () => {
    const orderId = randomUUID();
    const orderEmployeeId = randomUUID();
    const managerEmployeeId = randomUUID();
    const repository = {
      findByOption: jest.fn().mockResolvedValue({
        id: orderEmployeeId,
        orderId,
        employeeId: randomUUID(),
        status: OrderEmployeeStatusEnum.PENDING,
      }),
      findById: jest.fn().mockResolvedValue({
        id: orderEmployeeId,
        status: OrderEmployeeStatusEnum.REJECTED,
      }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const service = Object.create(OrderEmployeeService.prototype) as any;
    service.orderEmployeeRepository = repository;
    service.orderLeaderRepository = {
      findByOption: jest
        .fn()
        .mockResolvedValue({ orderId, employeeId: managerEmployeeId }),
    };

    await service.updateAssignmentStatus(
      orderId,
      orderEmployeeId,
      OrderEmployeeStatusEnum.REJECTED,
      { user: { role: UserRoleEnum.MANAGER, employeeId: managerEmployeeId } },
      {},
    );

    expect(service.orderLeaderRepository.findByOption).toHaveBeenCalledWith(
      { where: { orderId, employeeId: managerEmployeeId } },
      expect.anything(),
    );
    expect(repository.update).toHaveBeenCalledWith(
      orderEmployeeId,
      { status: OrderEmployeeStatusEnum.REJECTED },
      expect.anything(),
    );
  });

  it("rejects a manager account that is not an order leader", async () => {
    const orderId = randomUUID();
    const service = Object.create(OrderEmployeeService.prototype) as any;
    service.orderEmployeeRepository = {
      findByOption: jest.fn().mockResolvedValue({
        id: randomUUID(),
        orderId,
        status: OrderEmployeeStatusEnum.PENDING,
      }),
      update: jest.fn(),
    };
    service.orderLeaderRepository = {
      findByOption: jest.fn().mockResolvedValue(null),
    };

    await expect(
      service.updateAssignmentStatus(
        orderId,
        randomUUID(),
        OrderEmployeeStatusEnum.CONFIRMED,
        { user: { role: UserRoleEnum.MANAGER, employeeId: randomUUID() } },
        {},
      ),
    ).rejects.toThrow(
      "Chỉ quản lý của hợp đồng mới có thể cập nhật trạng thái nhân viên",
    );
  });

  it.each([
    {
      status: OrderEmployeeStatusEnum.CONFIRMED,
      title: "Nhân viên xác nhận thực hiện hợp đồng",
      content: "Nhân viên Nguyễn Văn A đã xác nhận thực hiện hợp đồng.",
    },
    {
      status: OrderEmployeeStatusEnum.REJECTED,
      title: "Nhân viên từ chối thực hiện hợp đồng",
      content: "Nhân viên Nguyễn Văn A đã từ chối thực hiện hợp đồng.",
    },
  ])("notifies admins, order leaders, and the order creator after a $status response", async ({
    status,
    title,
    content,
  }) => {
    const orderId = randomUUID();
    const adminUserId = randomUUID();
    const leaderUserId = randomUUID();
    const leaderEmployeeId = randomUUID();
    const creatorUserId = randomUUID();
    const creatorEmployeeId = randomUUID();
    const service = Object.create(OrderEmployeeService.prototype) as any;
    service.orderRepository = {
      findById: jest.fn().mockResolvedValue({
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
      getRepository: jest.fn().mockReturnValue({
        find: jest
          .fn()
          .mockResolvedValueOnce([{ id: adminUserId }])
          .mockResolvedValueOnce([{ id: leaderUserId }]),
      }),
      findUserIdsByEmployeeIds: jest.fn().mockResolvedValue([creatorUserId]),
    };
    service.notificationService = {
      createNotificationForMultipleUsers: jest
        .fn()
        .mockResolvedValue(undefined),
    };

    await service.notifyOrderEmployeeAssignmentStatus(
      orderId,
      { employee: { name: "Nguyễn Văn A" } },
      status,
    );

    expect(
      service.notificationService.createNotificationForMultipleUsers,
    ).toHaveBeenCalledWith(
      [adminUserId, leaderUserId, creatorUserId],
      expect.objectContaining({
        title,
        content,
        objectId: orderId,
      }),
      undefined,
      { orderCode: "HD0001" },
    );
  });
});

describe("OrderEmployeeController assignment status", () => {
  it("sends the status notification only after the update transaction commits", async () => {
    let committed = false;
    const result = {
      statusCode: 200,
      success: true,
      message: "OK",
      data: {
        isNewlyUpdated: true,
        orderEmployee: {
          id: randomUUID(),
          status: OrderEmployeeStatusEnum.CONFIRMED,
        },
      },
    };
    const service = {
      confirmAssignment: jest.fn().mockResolvedValue(result),
      notifyOrderEmployeeAssignmentStatus: jest
        .fn()
        .mockImplementation(async () => {
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
    const response = { status: jest.fn(), json: jest.fn() };
    response.status.mockReturnValue(response);
    const controller = new OrderEmployeeController(service, transactionManager, {
      notifyOrderAssigned: jest.fn(),
    } as any);

    await controller.confirmAssignment(
      { params: { orderId: "order-1", id: "order-employee-1" } } as any,
      response as any,
      jest.fn(),
    );

    expect(service.notifyOrderEmployeeAssignmentStatus).toHaveBeenCalledWith(
      "order-1",
      result.data.orderEmployee,
      OrderEmployeeStatusEnum.CONFIRMED,
    );
    expect(response.status).toHaveBeenCalledWith(200);
  });
});
