import { OrderComment } from "@/database/models/OrderComment";
import { EmployeeSelectLite } from "@/modules/employee/employee.select";
import { UserRelations } from "@/modules/user/user.select";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const OrderCommentSelectBasic: FindOptionsSelect<OrderComment> = {
  id: true,
  orderId: true,
  userId: true,
  content: true,
  timeAt: true,
  replyCommentId: true,
  note: true,
  tags: true,
};

export const OrderCommentSelectFull: FindOptionsSelect<OrderComment> = {
  ...OrderCommentSelectBasic,
  user: {
    id: true,
    employeeId: true,
    username: true,
    email: true,
    role: true,
    employee: EmployeeSelectLite,
  },
};

export const OrderCommentRelations: FindOptionsRelations<OrderComment> = {
  user: UserRelations,
};
