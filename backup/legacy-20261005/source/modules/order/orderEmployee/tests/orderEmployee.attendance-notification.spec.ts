import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: { get: jest.fn() },
}));

import { OrderEmployeeController } from "../orderEmployee.controller";

describe("OrderEmployeeController attendance notification", () => {
  it("sends checkout notification only after the transaction commits", async () => {
    let committed = false;
    const service = {
      checkOut: jest.fn().mockResolvedValue({
        statusCode: 200,
        data: { id: "order-employee-1" },
      }),
      notifyOrderEmployeeCheckOut: jest.fn().mockImplementation(async () => {
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
    const response = { status: jest.fn(), json: jest.fn() };
    response.status.mockReturnValue(response);
    const controller = new OrderEmployeeController(service, transactionManager, {
      notifyOrderAssigned: jest.fn(),
    } as any);

    await controller.checkOut(
      {
        params: { orderId: "order-1", id: "order-employee-1" },
        user: { employeeId: "employee-1" },
      } as any,
      response as any,
      jest.fn(),
    );

    expect(service.notifyOrderEmployeeCheckOut).toHaveBeenCalledWith("order-1", "employee-1");
    expect(response.status).toHaveBeenCalledWith(200);
  });
});
