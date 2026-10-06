import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: { get: jest.fn() },
}));

import { OrderService } from "../order.service";

describe("OrderService syncOrderLeaders", () => {
  it("does not alter field-team leaders when operational managers change", async () => {
    const fieldLeader = {
      id: "order-employee-field",
      employeeId: "field-employee",
      isLeader: true,
    };
    const managerAssignment = {
      id: "order-employee-manager",
      employeeId: "manager-employee",
      isLeader: false,
    };
    const orderLeaderRepository = {
      find: jest
        .fn()
        .mockResolvedValue([
          { id: "manager-old", employeeId: "manager-old-employee" },
        ]),
      softDelete: jest.fn().mockResolvedValue(undefined),
      create: jest.fn((data) => data),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const orderEmployeeService = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const service = Object.create(OrderService.prototype) as any;

    service.orderRepository = {
      getRepository: () => ({
        manager: {
          getRepository: () => orderLeaderRepository,
        },
      }),
    };
    service.orderEmployeeRepository = {
      findByOptions: jest
        .fn()
        .mockResolvedValue([fieldLeader, managerAssignment]),
    };
    service.orderEmployeeService = orderEmployeeService;

    await service.syncOrderLeaders("order-1", [
      { employeeId: "manager-employee" },
    ]);

    expect(orderLeaderRepository.softDelete).toHaveBeenCalledWith(
      "manager-old",
    );
    expect(orderLeaderRepository.save).toHaveBeenCalledWith({
      orderId: "order-1",
      employeeId: "manager-employee",
    });
    expect(orderEmployeeService.create).not.toHaveBeenCalled();
    expect(orderEmployeeService.update).not.toHaveBeenCalled();
    expect(orderEmployeeService.delete).not.toHaveBeenCalled();
  });
});
