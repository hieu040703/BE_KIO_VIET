export const SERVICE_ORDER_CHAT_TYPES = {
  ServiceOrderChatRepository: Symbol.for("ServiceOrderChatRepository"),
  ServiceOrderChatParticipantRepository: Symbol.for("ServiceOrderChatParticipantRepository"),
  ServiceOrderChatService: Symbol.for("ServiceOrderChatService"),
  ServiceOrderChatController: Symbol.for("ServiceOrderChatController"),
  ServiceOrderChatRouter: Symbol.for("ServiceOrderChatRouter"),
};

export const getServiceOrderChatRoomId = (serviceOrderId: string): string => `service-order-chat:${serviceOrderId}`;
