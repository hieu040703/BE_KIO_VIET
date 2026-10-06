import { OrderLeader } from "@/database/models/OrderLeader";
import { EmployeeSelectBasic } from "@/modules/employee/employee.select";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

// Chỉ lấy các field cần thiết để hiển thị mã + tên đơn hàng (tránh over-fetch)
export const OrderLeaderOrderSelectLite: FindOptionsSelect<OrderLeader> = {
  order: { id: true, code: true, name: true },
};

export const OrderLeaderSelectBasic: FindOptionsSelect<OrderLeader> = {
  id: true,
  position: true,
  orderId: true,
  employeeId: true,
  revenueShare: true,
  isRevenueShareAllocated: true,
  allocateRevenueId: true,
  note: true,
};

export const OrderLeaderSelectFull: FindOptionsSelect<OrderLeader> = {
  ...OrderLeaderSelectBasic,
  employee: {
    ...EmployeeSelectBasic,
    user: {
      id: true,
      username: true,
    },
  },
  ...OrderLeaderOrderSelectLite,
};

export const OrderLeaderRelations: FindOptionsRelations<OrderLeader> = {
  employee: {
    user: true,
  },
  order: true,
};
