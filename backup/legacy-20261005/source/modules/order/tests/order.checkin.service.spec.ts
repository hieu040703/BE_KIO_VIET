import "reflect-metadata";

jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

jest.mock("@/modules/container", () => ({
  __esModule: true,
  container: { get: jest.fn() },
}));

jest.mock("@/shared/utils/firebase/firebase.utils", () => ({
  __esModule: true,
  FirebaseUtils: {
    SentFirebaseWithUser: jest.fn(),
    SentFirebaseWithToken: jest.fn(),
    SentFirebaseWithTopic: jest.fn(),
  },
}));

import { randomUUID } from "crypto";
import { OrderService } from "../order.service";
import { OrderStatusEnum } from "@/shared/constants/constance";

describe("OrderService.checkIn", () => {
  it("persists the authenticated employee and submitted coordinates after validation", async () => {
    const orderId = randomUUID();
    const employeeId = randomUUID();
    const order = {
      id: orderId,
      status: OrderStatusEnum.PROCESSING,
      address: { latitude: 21.02917, longitude: 105.77728 },
    };
    const queryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(order),
    };
    const orderEmployeeService = {
      checkIn: jest.fn().mockResolvedValue(undefined),
      notifyOrderEmployeeCheckIn: jest.fn().mockResolvedValue(undefined),
    };
    const service = Object.create(OrderService.prototype) as any;
    service.orderRepository = {
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      }),
    };
    service.appSettingRepository = {
      getCheckInDistanceThreshold: jest.fn().mockResolvedValue(50),
    };
    service.orderEmployeeService = orderEmployeeService;
    let committed = false;
    orderEmployeeService.notifyOrderEmployeeCheckIn.mockImplementation(async () => {
      expect(committed).toBe(true);
    });
    service.transactionManager = {
      withTransactionCallback: jest.fn(async (callback: (manager: object) => Promise<unknown>) => {
        const result = await callback({});
        committed = true;
        return result;
      }),
    };

    await service.checkIn(
      orderId,
      {
        body: { latitude: 21.02917, longitude: 105.77728 },
        user: { employeeId },
      } as any,
    );

    expect(orderEmployeeService.checkIn).toHaveBeenCalledWith(
      orderId,
      employeeId,
      {
        latitude: 21.02917,
        longitude: 105.77728,
      },
      expect.anything(),
    );
    expect(orderEmployeeService.notifyOrderEmployeeCheckIn).toHaveBeenCalledWith(orderId, employeeId);
  });
});
