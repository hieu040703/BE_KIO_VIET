import { ServiceOrderChatMessage } from "@/database/models/ServiceOrderChatMessage";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const ServiceOrderChatMessageSelectBasic: FindOptionsSelect<ServiceOrderChatMessage> = {
  id: true,
  serviceOrderId: true,
  senderUserId: true,
  messageType: true,
  content: true,
  attachments: true,
  metadata: true,
  timeAt: true,
  tags: true,
  createdAt: true,
  sender: {
    id: true,
    name: true,
    username: true,
    avatar: true,
    role: true,
    employeeId: true,
    customerId: true,
  },
};

export const ServiceOrderChatMessageSelectFull: FindOptionsSelect<ServiceOrderChatMessage> = {
  ...ServiceOrderChatMessageSelectBasic,
};

export const ServiceOrderChatMessageRelations: FindOptionsRelations<ServiceOrderChatMessage> = {
  sender: true,
};
