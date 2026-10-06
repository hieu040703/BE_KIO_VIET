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
import { OrderStatusEnum, EntityTypeEnum, FileStatusEnum } from "@/shared/constants/constance";
import { OrderEmployeeService } from "../orderEmployee.service";

const createService = (overrides: Record<string, unknown> = {}) => {
  const service = Object.create(OrderEmployeeService.prototype) as any;
  service.orderRepository = {
    findById: jest.fn().mockResolvedValue({ status: OrderStatusEnum.COMPLETED }),
  };
  service.orderEmployeeRepository = {
    findByOption: jest.fn().mockResolvedValue({
      id: randomUUID(),
      checkOutAt: null,
    }),
    update: jest.fn().mockResolvedValue({ checkOutAt: new Date() }),
  };
  service.fileRepository = {
    findByOptions: jest.fn().mockResolvedValue([{ id: randomUUID() }]),
  };

  Object.assign(service, overrides);
  return service;
};

describe("OrderEmployeeService.checkOut", () => {
  it("updates checkOutAt for the authenticated employee after an active order file exists", async () => {
    const orderId = randomUUID();
    const orderEmployeeId = randomUUID();
    const employeeId = randomUUID();
    const service = createService({
      orderEmployeeRepository: {
        findByOption: jest.fn().mockResolvedValue({
          id: orderEmployeeId,
          orderId,
          employeeId,
          checkOutAt: null,
        }),
        update: jest.fn().mockResolvedValue({ id: orderEmployeeId, checkOutAt: new Date() }),
      },
    });

    const result = await service.checkOut(
      orderId,
      orderEmployeeId,
      { user: { employeeId }, body: { breakTime: 1.5 } },
      {},
    );

    expect(service.fileRepository.findByOptions).toHaveBeenCalledWith(
      {
        where: {
          entityType: EntityTypeEnum.ORDER,
          entityId: orderId,
          status: FileStatusEnum.ACTIVE,
        },
      },
      expect.anything(),
    );
    expect(service.orderEmployeeRepository.findByOption).toHaveBeenCalledWith(
      { where: { id: orderEmployeeId, orderId, employeeId } },
      expect.anything(),
    );
    expect(service.orderEmployeeRepository.update).toHaveBeenCalledWith(
      orderEmployeeId,
      {
        breakTime: 1.5,
        checkOutAt: expect.any(Date),
        endTime: expect.stringMatching(/^\d{2}:\d{2}:\d{2}$/),
      },
      expect.anything(),
    );
    expect(result.statusCode).toBe(200);
  });

  it("rejects checkout when the order is not completed", async () => {
    const service = createService();
    service.orderRepository.findById.mockResolvedValue({ status: OrderStatusEnum.PROCESSING });

    await expect(
      service.checkOut(randomUUID(), randomUUID(), {
        user: { employeeId: randomUUID() },
        body: { breakTime: 1.5 },
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Chỉ có thể checkout khi hợp đồng đã hoàn thành",
    });
    expect(service.fileRepository.findByOptions).not.toHaveBeenCalled();
    expect(service.orderEmployeeRepository.update).not.toHaveBeenCalled();
  });

  it("rejects checkout when the order has no active file", async () => {
    const service = createService();
    service.fileRepository.findByOptions.mockResolvedValue([]);

    await expect(
      service.checkOut(randomUUID(), randomUUID(), {
        user: { employeeId: randomUUID() },
        body: { breakTime: 1.5 },
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Hợp đồng phải có tài liệu trước khi checkout",
    });
    expect(service.orderEmployeeRepository.update).not.toHaveBeenCalled();
  });

  it("rejects checkout when the employee is not assigned to the order", async () => {
    const service = createService();
    service.orderEmployeeRepository.findByOption.mockResolvedValue(null);

    await expect(
      service.checkOut(randomUUID(), randomUUID(), {
        user: { employeeId: randomUUID() },
        body: { breakTime: 1.5 },
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
      message: "Nhân viên không thuộc hợp đồng",
    });
    expect(service.fileRepository.findByOptions).not.toHaveBeenCalled();
  });

  it("does not overwrite an existing checkout time", async () => {
    const service = createService();
    service.orderEmployeeRepository.findByOption.mockResolvedValue({
      id: randomUUID(),
      checkOutAt: new Date(),
    });

    await expect(
      service.checkOut(randomUUID(), randomUUID(), {
        user: { employeeId: randomUUID() },
        body: { breakTime: 1.5 },
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Nhân viên đã checkout hợp đồng này",
    });
    expect(service.orderEmployeeRepository.update).not.toHaveBeenCalled();
  });

  it("requires breakTime when checking out", async () => {
    const service = createService();

    await expect(
      service.checkOut(randomUUID(), randomUUID(), {
        user: { employeeId: randomUUID() },
        body: {},
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Số giờ giải lao là bắt buộc và không được âm",
    });
    expect(service.orderRepository.findById).not.toHaveBeenCalled();
  });
});
