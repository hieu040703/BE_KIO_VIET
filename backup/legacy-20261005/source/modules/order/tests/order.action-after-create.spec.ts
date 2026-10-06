import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: {
    get: jest.fn(),
  },
}));

import { Order } from "@/database/models/Order";
import {
  PositionDefaultEnum,
  UserRoleEnum,
} from "@/shared/constants/constance";
import { BaseService } from "@/shared/base/BaseService";
import { OrderService } from "../order.service";

describe("OrderService actionAfterCreate", () => {
  it("creates the branch manager leader even when the request user cannot yet see the new order", async () => {
    const managerEmployeeId = "manager-employee-id";
    const orderId = "order-id";
    const transactionManager = {} as any;
    const savedOrder = {
      id: orderId,
      branchManagerId: managerEmployeeId,
      employeeId: null,
      amount: 1_000_000,
      deposit: 0,
    } as Partial<Order>;
    const branchManager = { id: managerEmployeeId };
    const orderRepository = {
      create: jest.fn().mockResolvedValue(savedOrder),
      findById: jest.fn().mockResolvedValue(null),
    };
    const orderLeaderRepository = {
      create: jest.fn().mockResolvedValue(undefined),
    };
    const service = Object.create(OrderService.prototype) as OrderService;

    Object.assign(service as any, {
      repository: orderRepository,
      validateBeforeCreate: jest.fn(),
      employeeRepository: {
        findById: jest.fn().mockResolvedValue(branchManager),
      },
      orderLeaderRepository,
    });

    const req = {
      user: {
        employeeId: managerEmployeeId,
        role: UserRoleEnum.MANAGER,
      },
    } as any;

    await BaseService.prototype.create.call(
      service,
      savedOrder,
      req,
      transactionManager,
    );

    expect(orderLeaderRepository.create).toHaveBeenCalledWith(
      {
        position: PositionDefaultEnum.BRANCH_MANAGER,
        orderId,
        employeeId: managerEmployeeId,
        revenueShare: savedOrder.amount,
      },
      transactionManager,
    );
  });
});
