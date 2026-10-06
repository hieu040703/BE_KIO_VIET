import { SupportRoomChatMessage } from "@/database/models/SupportRoomChatMessage";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const SupportRoomChatMessageSelectFull: FindOptionsSelect<SupportRoomChatMessage> = {
  id: true,
  supportRoomId: true,
  senderUserId: true,
  messageType: true,
  content: true,
  attachments: true,
  metadata: true,
  timeAt: true,
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

export const SupportRoomChatMessageRelations: FindOptionsRelations<SupportRoomChatMessage> = {
  sender: true,
};
