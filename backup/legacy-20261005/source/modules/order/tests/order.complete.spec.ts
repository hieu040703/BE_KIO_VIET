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

import { Request, Response } from "express";
import { OrderStatusEnum, RewardPointTypeEnum, UserRoleEnum } from "@/shared/constants/constance";
import { OrderController } from "../order.controller";
import { OrderService } from "../order.service";
import { EmployeeRepository } from "../../employee/employee.repository";
import { OrderEmployeeRepository } from "../orderEmployee/orderEmployee.repository";
import { OrderEmployeeService } from "../orderEmployee/orderEmployee.service";

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

describe("OrderEmployeeService.updateEndTime", () => {
  it("uses one repository bulk operation and returns the affected employee ids", async () => {
    const employeeIds = Array.from({ length: 20 }, (_, index) => `employee-${index + 1}`);
    const manager = {} as any;
    const orderEmployeeRepository = {
      completeEmployeesForOrder: jest.fn().mockResolvedValue(employeeIds),
      findByOptions: jest.fn(),
      updateMany: jest.fn(),
      setOptions: jest.fn(),
    } as any;

    const service = new OrderEmployeeService(
      orderEmployeeRepository,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    const result = await service.updateEndTime("order-1", manager);

    expect(orderEmployeeRepository.completeEmployeesForOrder).toHaveBeenCalledWith(
      "order-1",
      expect.stringMatching(/^\d{2}:\d{2}:\d{2}$/),
      manager,
    );
    expect(orderEmployeeRepository.findByOptions).not.toHaveBeenCalled();
    expect(orderEmployeeRepository.updateMany).not.toHaveBeenCalled();
    expect(result).toEqual(employeeIds);
  });
});

describe("Bulk completion repositories", () => {
  it("completes and synchronizes 100 employees with one database query", async () => {
    const employeeIds = Array.from({ length: 100 }, (_, index) => `employee-${index + 1}`);
    const manager = {
      query: jest.fn().mockResolvedValue(employeeIds.map((employeeId) => ({ employeeId }))),
    } as any;
    const repository = Object.create(OrderEmployeeRepository.prototype) as OrderEmployeeRepository;

    const result = await repository.completeEmployeesForOrder("order-1", "17:30:00", manager);

    expect(manager.query).toHaveBeenCalledTimes(1);
    expect(manager.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE "time_keepings"'),
      ["order-1", "17:30:00"],
    );
    expect(result).toEqual(employeeIds);
  });

  it("checks null and non-positive salaries with one exists query", async () => {
    const manager = {
      query: jest.fn().mockResolvedValue([{ exists: true }]),
    } as any;
    const repository = Object.create(OrderEmployeeRepository.prototype) as OrderEmployeeRepository;

    const result = await repository.hasEmployeesWithoutSalary("order-1", manager);

    expect(manager.query).toHaveBeenCalledTimes(1);
    expect(manager.query).toHaveBeenCalledWith(expect.stringContaining('"salary" <= 0'), ["order-1"]);
    expect(result).toBe(true);
  });

  it("updates the status of 100 employees with one database query", async () => {
    const employeeIds = Array.from({ length: 100 }, (_, index) => `employee-${index + 1}`);
    const manager = {
      query: jest.fn().mockResolvedValue([]),
    } as any;
    const repository = Object.create(EmployeeRepository.prototype) as EmployeeRepository;

    await repository.updateEmployeeStatuses([...employeeIds, employeeIds[0]], manager);

    expect(manager.query).toHaveBeenCalledTimes(1);
    expect(manager.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE "employees"'), [employeeIds]);
  });
});

describe("OrderService.completeOrder", () => {
  it("uses bulk validation/status updates and does not duplicate debt, reward points, or notification", async () => {
    const order = {
      id: "order-1",
      code: "HD001",
      status: OrderStatusEnum.PROCESSING,
      amount: 1_000_000,
      customerId: "customer-1",
      serviceOrderId: null,
      timeAt: new Date("2026-07-30T03:00:00.000Z"),
    };
    const queryBuilder = createLockedOrderQuery(order);
    const manager = {} as any;
    const employeeIds = ["employee-1", "employee-2"];
    const updateOrderDirectly = jest.fn();
    const existingDebt = { id: "debt-1", amount: order.amount };
    const existingReward = {
      id: "reward-1",
      orderId: order.id,
      type: RewardPointTypeEnum.EARNED,
      points: 10,
    };

    const service = Object.create(OrderService.prototype) as OrderService;
    Object.assign(service as any, {
      orderRepository: {
        getRepository: jest.fn().mockReturnValue({
          createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          update: updateOrderDirectly,
        }),
        update: jest.fn(),
      },
      orderEmployeeRepository: {
        hasEmployeesWithoutSalary: jest.fn().mockResolvedValue(false),
      },
      orderEmployeeService: {
        updateEndTime: jest.fn().mockResolvedValue(employeeIds),
        findByOptions: jest.fn(),
      },
      employeeRepository: {
        updateEmployeeStatuses: jest.fn(),
        updateEmployeeStatusByOrder: jest.fn(),
      },
      orderCommentService: {
        create: jest.fn(),
      },
      debtRepository: {
        findOne: jest.fn().mockResolvedValue(existingDebt),
        update: jest.fn(),
      },
      debtService: {
        create: jest.fn(),
      },
      rewardPointRepository: {
        findOne: jest.fn().mockResolvedValue(existingReward),
        create: jest.fn(),
        update: jest.fn(),
      },
      serviceOrderRepository: {
        update: jest.fn(),
      },
      calculateOrderData: {
        process: jest.fn(),
      },
      sendNotificationToCustomer: jest.fn(),
    });

    await service.completeOrder("order-1", { user: { role: UserRoleEnum.ADMIN } } as Request, manager);

    expect((service as any).orderEmployeeRepository.hasEmployeesWithoutSalary).toHaveBeenCalledWith(
      "order-1",
      manager,
    );
    expect((service as any).orderEmployeeService.findByOptions).not.toHaveBeenCalled();
    expect((service as any).employeeRepository.updateEmployeeStatuses).toHaveBeenCalledWith(employeeIds, manager);
    expect((service as any).employeeRepository.updateEmployeeStatusByOrder).not.toHaveBeenCalled();
    expect(updateOrderDirectly).toHaveBeenCalledWith("order-1", {
      status: OrderStatusEnum.COMPLETED,
    });
    expect((service as any).orderRepository.update).not.toHaveBeenCalled();
    expect((service as any).debtService.create).not.toHaveBeenCalled();
    expect((service as any).rewardPointRepository.create).not.toHaveBeenCalled();
    expect((service as any).sendNotificationToCustomer).not.toHaveBeenCalled();
  });
});

describe("OrderController.completeOrder", () => {
  const createResponse = () => {
    const response = {
      status: jest.fn(),
      json: jest.fn(),
    };
    response.status.mockReturnValue(response);
    response.json.mockReturnValue(response);
    return response as unknown as Response;
  };

  it("runs notification and tracking only after the transaction commits", async () => {
    let committed = false;
    const service = {
      completeOrder: jest.fn().mockResolvedValue({
        statusCode: 201,
        success: true,
        message: "OK",
      }),
      notifyOrderCompleted: jest.fn().mockImplementation(async () => {
        expect(committed).toBe(true);
      }),
      notifyOrderCompletedViaZalo: jest.fn().mockImplementation(async () => {
        expect(committed).toBe(true);
      }),
    } as any;
    const transactionManager = {
      withTransaction: jest.fn().mockImplementation(async (callback) => {
        const result = await callback({ manager: {} });
        committed = true;
        return result;
      }),
    } as any;
    const goongMapService = {
      stopOrderTracking: jest.fn().mockImplementation(async () => {
        expect(committed).toBe(true);
      }),
    } as any;
    const controller = new OrderController(service, transactionManager, goongMapService);
    const response = createResponse();
    const next = jest.fn();

    await controller.completeOrder({ params: { id: "order-1" } } as unknown as Request, response, next);

    expect(service.notifyOrderCompleted).toHaveBeenCalledWith("order-1");
    expect(service.notifyOrderCompletedViaZalo).toHaveBeenCalledWith("order-1");
    expect(goongMapService.stopOrderTracking).toHaveBeenCalledWith("order-1", "completed");
    expect(response.status).toHaveBeenCalledWith(201);
    expect(next).not.toHaveBeenCalled();
  });

  it("still returns success when a post-commit side effect fails", async () => {
    const result = {
      statusCode: 201,
      success: true,
      message: "OK",
    };
    const service = {
      completeOrder: jest.fn().mockResolvedValue(result),
      notifyOrderCompleted: jest.fn().mockRejectedValue(new Error("notification unavailable")),
      notifyOrderCompletedViaZalo: jest.fn().mockRejectedValue(new Error("zalo unavailable")),
    } as any;
    const transactionManager = {
      withTransaction: jest.fn().mockImplementation(async (callback) => callback({ manager: {} })),
    } as any;
    const goongMapService = {
      stopOrderTracking: jest.fn().mockRejectedValue(new Error("tracking unavailable")),
    } as any;
    const controller = new OrderController(service, transactionManager, goongMapService);
    const response = createResponse();
    const next = jest.fn();

    await controller.completeOrder({ params: { id: "order-1" } } as unknown as Request, response, next);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(result);
    expect(next).not.toHaveBeenCalled();
  });
});
