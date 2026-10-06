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

import { Request } from "express";
import {
  OrderEmployeeStatusEnum,
  OrderStatusEnum,
  UserRoleEnum,
} from "@/shared/constants/constance";
import { OrderEmployeeRepository } from "../orderEmployee/orderEmployee.repository";
import { OrderService } from "../order.service";

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

describe("OrderEmployeeRepository completion guard", () => {
  it("detects confirmed employees who have not checked out with one exists query", async () => {
    const manager = {
      query: jest.fn().mockResolvedValue([{ exists: true }]),
    } as any;
    const repository = Object.create(OrderEmployeeRepository.prototype) as OrderEmployeeRepository;

    const result = await repository.hasConfirmedEmployeesWithoutCheckout("order-1", manager);

    expect(manager.query).toHaveBeenCalledWith(
      expect.stringContaining('"status" = $2::"order_employees_status_enum"'),
      ["order-1", OrderEmployeeStatusEnum.CONFIRMED],
    );
    expect(result).toBe(true);
  });
});

describe("OrderService completion guards", () => {
  it("rejects non-admin completion before the leader has confirmed the order", async () => {
    const queryBuilder = createLockedOrderQuery({
      id: "order-1",
      status: OrderStatusEnum.PROCESSING,
      amount: 1_000_000,
      completedByEmployeeId: null,
      completedAt: null,
    });
    const service = Object.create(OrderService.prototype) as OrderService;
    Object.assign(service as any, {
      orderRepository: {
        getRepository: jest.fn().mockReturnValue({
          createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
        }),
      },
    });

    await expect(
      service.completeOrder(
        "order-1",
        { user: { role: UserRoleEnum.MANAGER } } as Request,
        {} as any,
      ),
    ).rejects.toThrow(
      "Nhân viên đầu cánh phải xác nhận hoàn thành trước khi quản lý hoàn thành hợp đồng",
    );
  });

  it("allows ADMIN to complete an order without leader confirmation", async () => {
    const updateOrder = jest.fn();
    const queryBuilder = createLockedOrderQuery({
      id: "order-1",
      status: OrderStatusEnum.PROCESSING,
      amount: 1_000_000,
      completedByEmployeeId: null,
      completedAt: null,
    });
    const service = Object.create(OrderService.prototype) as OrderService;
    Object.assign(service as any, {
      orderRepository: {
        getRepository: jest.fn().mockReturnValue({
          createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          update: updateOrder,
        }),
      },
      orderEmployeeRepository: {
        hasEmployeesWithoutSalary: jest.fn().mockResolvedValue(false),
        findByOptions: jest.fn().mockResolvedValue([{ employeeId: "employee-1" }]),
      },
      orderCommentService: { create: jest.fn() },
      employeeRepository: { updateEmployeeStatuses: jest.fn() },
      calculateOrderData: { process: jest.fn() },
    });

    const result = await service.completeOrder(
      "order-1",
      { user: { role: UserRoleEnum.ADMIN } } as Request,
      {} as any,
    );

    expect(result.success).toBe(true);
    expect(updateOrder).toHaveBeenCalledWith("order-1", {
      status: OrderStatusEnum.COMPLETED,
    });
  });
});
