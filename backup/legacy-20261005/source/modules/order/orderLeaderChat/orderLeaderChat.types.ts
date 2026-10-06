export const ORDER_LEADER_CHAT_TYPES = {
  OrderLeaderChatService: Symbol.for("orderLeaderChatService"),
  OrderLeaderChatController: Symbol.for("orderLeaderChatController"),
  OrderLeaderChatRepository: Symbol.for("orderLeaderChatRepository"),
  OrderLeaderChatReadStateRepository: Symbol.for("orderLeaderChatReadStateRepository"),
  OrderLeaderChatRouter: Symbol.for("orderLeaderChatRouter"),
};

export const getOrderLeaderChatRoomId = (orderId: string): string => `order-leader-chat:${orderId}`;
