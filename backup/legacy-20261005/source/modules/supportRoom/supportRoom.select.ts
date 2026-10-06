import { SupportRoom } from "@/database/models/SupportRoom";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const SupportRoomSelectBasic: FindOptionsSelect<SupportRoom> = {
  id: true,
  name: true,
  customerId: true,
  hasUnreadMessages: true,
  createdAt: true,
  updatedAt: true,
};

export const SupportRoomSelectFull: FindOptionsSelect<SupportRoom> = {
  ...SupportRoomSelectBasic,
  customer: {
    id: true,
    name: true,
    phone: true,
    code: true,
    avatar: true,
  },
};

export const SupportRoomRelations: FindOptionsRelations<SupportRoom> = {
  customer: true,
};
