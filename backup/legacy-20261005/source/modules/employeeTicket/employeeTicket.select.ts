import { EmployeeTicket } from "@/database/models/EmployeeTicket";
import { EmployeeSelectLite } from "../employee/employee.select";
import { UserSelectLite } from "../user/user.select";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const EmployeeTicketSelectBasic: FindOptionsSelect<EmployeeTicket> = {
  id: true,
  employeeId: true,
  createdByUserId: true,
  type: true,
  priority: true,
  issue: true,
  description: true,
  attachments: true,
  status: true,
  note: true,
  createdAt: true,
  updatedAt: true,
};

export const EmployeeTicketSelectFull: FindOptionsSelect<EmployeeTicket> = {
  ...EmployeeTicketSelectBasic,
  employee: EmployeeSelectLite,
  createdByUser: {
    ...UserSelectLite,
    role: true,
  },
};

export const EmployeeTicketRelations: FindOptionsRelations<EmployeeTicket> = {
  employee: true,
  createdByUser: true,
};
