import { OrderEmployee } from "@/database/models/OrderEmployee";
import { EmployeeSelectBasic, EmployeeSelectLite } from "@/modules/employee/employee.select";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const OrderEmployeeSelectBasic: FindOptionsSelect<OrderEmployee> = {
  id: true,
  orderId: true,
  employeeId: true,
  timeAt: true,
  checkInAt: true,
  checkInLatitude: true,
  checkInLongitude: true,
  checkOutAt: true,
  startTime: true,
  endTime: true,
  breakTime: true,
  totalHours: true,
  salary: true,
  isConfirmed: true,
  status: true,
  isLeader: true,
  leaderPercentAmount: true,
  hasNotifiedCheckIn: true,
  note: true,
  createdAt: true,
};

export const OrderEmployeeSelectFull: FindOptionsSelect<OrderEmployee> = {
  ...OrderEmployeeSelectBasic,
  employee: {
    ...EmployeeSelectLite,
    branch: {
      id: true,
      name: true,
    },
    user: {
      id: true,
      username: true,
    },
  },
};

export const OrderEmployeeRelations: FindOptionsRelations<OrderEmployee> = {
  employee: {
    branch: true,
    user: true,
  },
  timeKeeping: true,
};
