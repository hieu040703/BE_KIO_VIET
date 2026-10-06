import { SocketUtils } from "@/shared/utils/socket.utils";

export const GOONG_ORDER_TRACKING_EVENTS = {
  ORDER_ASSIGNED: "order_assigned",
  PING_LOCATION: "ping_location",
  STOP_TRACKING: "stop_tracking",
  LOCATION_UPDATED: "order_location_updated",
} as const;

export type GoongOrderTrackingSocketEvent =
  (typeof GOONG_ORDER_TRACKING_EVENTS)[keyof typeof GOONG_ORDER_TRACKING_EVENTS];

export const getGoongOrderTrackingRoomId = (orderId: string): string => `order-tracking:${orderId}`;

export type GoongOrderTrackingCommandPayload = {
  orderId: string;
  serviceOrderId: string | null;
  employeeId: string;
  trackingRoomId: string;
  requestedAt: string;
  reason: "assigned" | "scheduled" | "stopped";
};

export const buildGoongOrderTrackingCommandPayload = (
  orderId: string,
  employeeId: string,
  serviceOrderId: string | null,
  reason: GoongOrderTrackingCommandPayload["reason"],
): GoongOrderTrackingCommandPayload => ({
  orderId,
  serviceOrderId,
  employeeId,
  trackingRoomId: getGoongOrderTrackingRoomId(orderId),
  requestedAt: new Date().toISOString(),
  reason,
});

export const emitGoongOrderTrackingToUsers = (
  userIds: Array<string | null | undefined>,
  event: GoongOrderTrackingSocketEvent,
  payload: unknown,
): void => {
  userIds.filter((userId): userId is string => !!userId).forEach((userId) => {
    SocketUtils.sendSocketToUser(event, userId, payload);
  });
};
