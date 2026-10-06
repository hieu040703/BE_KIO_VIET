import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { Announcement } from "@/database/models/Announcement";

export const AnnouncementSelectFull: FindOptionsSelect<Announcement> = {
  id: true,
  title: true,
  content: true,
  sentAt: true,
  sentBy: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  sender: {
    id: true,
    code: true,
    name: true,
  },
};

export const AnnouncementRelations: FindOptionsRelations<Announcement> = {
  sender: true,
};
