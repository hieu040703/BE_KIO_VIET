import { NotificationDetail } from "@/database/models/NotificationDetail";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const NotificationDetailSelectBasic: FindOptionsSelect<NotificationDetail> = {
  id: true,
  userId: true,
  notificationId: true,
  isRead: true,
};

export const NotificationDetailSelectFull: FindOptionsSelect<NotificationDetail> = {
  ...NotificationDetailSelectBasic,
};

export const NotificationDetailRelations: FindOptionsRelations<NotificationDetail> = {};
