import { EmployeeSelectLite } from "@/modules/employee/employee.select";
import { OrderLeaderChat } from "@/database/models/OrderLeaderChat";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const OrderLeaderChatSelectBasic: FindOptionsSelect<OrderLeaderChat> = {
  id: true,
  orderId: true,
  userId: true,
  replyMessageId: true,
  content: true,
  attachments: true,
  timeAt: true,
  tags: true,
  note: true,
  createdAt: true,
};

export const OrderLeaderChatSelectFull: FindOptionsSelect<OrderLeaderChat> = {
  ...OrderLeaderChatSelectBasic,
  user: {
    id: true,
    employeeId: true,
    username: true,
    name: true,
    avatar: true,
    role: true,
    employee: EmployeeSelectLite,
  },
};

export const OrderLeaderChatRelations: FindOptionsRelations<OrderLeaderChat> = {
  user: {
    employee: true,
  },
};
