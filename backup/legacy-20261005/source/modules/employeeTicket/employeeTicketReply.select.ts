import { EmployeeTicketReply } from "@/database/models/EmployeeTicketReply";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const EmployeeTicketReplySelectFull: FindOptionsSelect<EmployeeTicketReply> = {
  id: true,
  employeeTicketId: true,
  userId: true,
  content: true,
  type: true,
  attachments: true,
  note: true,
  createdAt: true,
  updatedAt: true,
  user: {
    id: true,
    name: true,
    role: true,
    employeeId: true,
  },
};

export const EmployeeTicketReplyRelations: FindOptionsRelations<EmployeeTicketReply> = {
  user: true,
};
