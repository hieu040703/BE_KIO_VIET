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

import { Request } from "express";
import { OrderService } from "../order.service";
import { OrderStatusEnum } from "@/shared/constants/constance";

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

describe("OrderService.cancelOrder", () => {
  it("expires every call navigation in the same transaction", async () => {
    const manager = {} as any;
    const order = {
      id: "order-1",
      status: OrderStatusEnum.PROCESSING,
      serviceOrderId: null,
    };
    const queryBuilder = createLockedOrderQuery(order);
    const stopCallNavigationByOrder = jest.fn().mockResolvedValue(undefined);
    const service = Object.create(OrderService.prototype) as OrderService;

    Object.assign(service as any, {
      orderRepository: {
        getRepository: jest.fn().mockReturnValue({
          createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
        }),
        update: jest.fn().mockResolvedValue(undefined),
      },
      callNavigationService: { stopCallNavigationByOrder },
      orderCommentService: { create: jest.fn().mockResolvedValue(undefined) },
      employeeRepository: { updateEmployeeStatusByOrder: jest.fn().mockResolvedValue(undefined) },
      debtRepository: { deleteFromOrder: jest.fn().mockResolvedValue(undefined) },
    });

    await service.cancelOrder("order-1", {} as Request, manager);

    expect(stopCallNavigationByOrder).toHaveBeenCalledWith("order-1", manager);
  });
});
