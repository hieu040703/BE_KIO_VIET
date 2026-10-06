import { EmployeeTicketParticipant } from "@/database/models/EmployeeTicketParticipant";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const EmployeeTicketParticipantSelectFull: FindOptionsSelect<EmployeeTicketParticipant> = {
  id: true,
  employeeTicketId: true,
  userId: true,
  addedByUserId: true,
  removedByUserId: true,
  createdAt: true,
  updatedAt: true,
  user: {
    id: true,
    name: true,
    code: true,
    email: true,
    phone: true,
    avatar: true,
    role: true,
    employeeId: true,
  },
  addedByUser: {
    id: true,
    name: true,
    code: true,
    role: true,
  },
};

export const EmployeeTicketParticipantRelations: FindOptionsRelations<EmployeeTicketParticipant> = {
  user: true,
  addedByUser: true,
};
