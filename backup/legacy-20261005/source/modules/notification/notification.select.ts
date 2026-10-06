import { Notification } from "@/database/models/Notification";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { NotificationDetailSelectBasic } from "../notificationDetail/notificationDetail.select";

export const NotificationSelectBasic: FindOptionsSelect<Notification> = {
  id: true,
  title: true,
  content: true,
  timeAt: true,
  type: true,
  metadata: true,
  objectId: true,
  createdBy: true,
  createdAt: true,
};

export const NotificationSelectFull: FindOptionsSelect<Notification> = {
  ...NotificationSelectBasic,
  details: NotificationDetailSelectBasic,
};

export const NotificationRelations: FindOptionsRelations<Notification> = {
  details: true,
};
