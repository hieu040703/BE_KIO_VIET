import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("../order.service", () => ({
  OrderService: class {},
}));

jest.mock("@/shared/base/BaseController", () => ({
  BaseController: class {},
}));

jest.mock("../../goongMap/goongMap.service", () => ({
  GoongMapService: class {},
}));

import { OrderController } from "../order.controller";

describe("OrderController.makeCallToCustomer", () => {
  it("calls the service with the order id and transaction manager", async () => {
    const result = {
      statusCode: 200,
      success: true,
      data: { phone: "0900000000" },
    };
    const service = {
      makeCallToCustomer: jest.fn().mockResolvedValue(result),
    };
    const transactionManager = {
      withTransaction: jest.fn(
        async (operation: (tx: { manager: unknown }) => Promise<unknown>) =>
          operation({ manager: "transaction-manager" }),
      ),
    };
    const controller = new OrderController(
      service as any,
      transactionManager as any,
      {} as any,
    );
    const req = { params: { id: "order-1" } } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
    const next = jest.fn();

    await controller.makeCallToCustomer(req, res, next);

    expect(service.makeCallToCustomer).toHaveBeenCalledWith(
      req.params.id,
      req,
      "transaction-manager",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
    expect(next).not.toHaveBeenCalled();
  });
});
