import { SocketUtils } from "@/shared/utils/socket.utils";

export const ORDER_TRACKING_EVENTS = {
  ORDER_ASSIGNED: "order_assigned",
  PING_LOCATION: "ping_location",
  STOP_TRACKING: "stop_tracking",
  LOCATION_UPDATED: "order_location_updated",
} as const;

export type OrderTrackingSocketEvent =
  (typeof ORDER_TRACKING_EVENTS)[keyof typeof ORDER_TRACKING_EVENTS];

export const getOrderTrackingRoomId = (orderId: string): string => `order-tracking:${orderId}`;

export type OrderTrackingCommandPayload = {
  orderId: string;
  serviceOrderId: string | null;
  employeeId: string;
  trackingRoomId: string;
  requestedAt: string;
  reason: "assigned" | "scheduled" | "stopped";
};

export const buildOrderTrackingCommandPayload = (
  orderId: string,
  employeeId: string,
  serviceOrderId: string | null,
  reason: OrderTrackingCommandPayload["reason"],
): OrderTrackingCommandPayload => ({
  orderId,
  serviceOrderId,
  employeeId,
  trackingRoomId: getOrderTrackingRoomId(orderId),
  requestedAt: new Date().toISOString(),
  reason,
});

export const emitOrderTrackingToUsers = (
  userIds: Array<string | null | undefined>,
  event: OrderTrackingSocketEvent,
  payload: unknown,
): void => {
  userIds.filter((userId): userId is string => !!userId).forEach((userId) => {
    SocketUtils.sendSocketToUser(event, userId, payload);
  });
};
