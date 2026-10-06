jest.mock("@/shared/utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

jest.mock("../goongOrderTracking.socket", () => ({
  GOONG_ORDER_TRACKING_EVENTS: {
    ORDER_ASSIGNED: "order_assigned",
    PING_LOCATION: "ping_location",
    STOP_TRACKING: "stop_tracking",
    LOCATION_UPDATED: "order_location_updated",
  },
  buildGoongOrderTrackingCommandPayload: jest.fn((orderId, employeeId, serviceOrderId, reason) => ({
    orderId,
    employeeId,
    serviceOrderId,
    reason,
  })),
  emitGoongOrderTrackingToUsers: jest.fn(),
  getGoongOrderTrackingRoomId: jest.fn((orderId) => `order-tracking:${orderId}`),
}));

import { GoongMapService } from "../goongMap.service";
import {
  emitGoongOrderTrackingToUsers,
  GOONG_ORDER_TRACKING_EVENTS,
} from "../goongOrderTracking.socket";

describe("GoongMapService.sendPingRequestsForActiveOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends one ping per order assignment and skips employees without an account", async () => {
    const service = Object.create(GoongMapService.prototype) as any;
    service.goongMapRepository = {
      findActiveTrackingTargets: jest.fn().mockResolvedValue([
        {
          orderId: "order-1",
          serviceOrderId: null,
          customerId: "customer-1",
          employeeId: "employee-1",
          employeeUserId: "user-1",
          customerUserId: null,
        },
        {
          orderId: "order-2",
          serviceOrderId: null,
          customerId: "customer-2",
          employeeId: "employee-1",
          employeeUserId: "user-1",
          customerUserId: null,
        },
        {
          orderId: "order-1",
          serviceOrderId: null,
          customerId: "customer-1",
          employeeId: "employee-2",
          employeeUserId: "user-2",
          customerUserId: null,
        },
        {
          orderId: "order-1",
          serviceOrderId: null,
          customerId: "customer-1",
          employeeId: "employee-3",
          employeeUserId: null,
          customerUserId: null,
        },
      ]),
    };

    await service.sendPingRequestsForActiveOrders();

    expect(emitGoongOrderTrackingToUsers).toHaveBeenCalledTimes(3);
    expect(emitGoongOrderTrackingToUsers).toHaveBeenNthCalledWith(
      1,
      ["user-1"],
      GOONG_ORDER_TRACKING_EVENTS.PING_LOCATION,
      expect.objectContaining({ orderId: "order-1", employeeId: "employee-1", reason: "scheduled" }),
    );
    expect(emitGoongOrderTrackingToUsers).toHaveBeenNthCalledWith(
      2,
      ["user-1"],
      GOONG_ORDER_TRACKING_EVENTS.PING_LOCATION,
      expect.objectContaining({ orderId: "order-2", employeeId: "employee-1", reason: "scheduled" }),
    );
    expect(emitGoongOrderTrackingToUsers).toHaveBeenNthCalledWith(
      3,
      ["user-2"],
      GOONG_ORDER_TRACKING_EVENTS.PING_LOCATION,
      expect.objectContaining({ orderId: "order-1", employeeId: "employee-2", reason: "scheduled" }),
    );
  });
});
