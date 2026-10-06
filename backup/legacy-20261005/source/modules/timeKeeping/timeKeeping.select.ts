import { TimeKeeping } from "@/database/models/TimeKeeping";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { EmployeeSelectLite } from "../employee/employee.select";
import { OrderEmployeeSelectBasic, OrderEmployeeSelectFull } from "../order/orderEmployee/orderEmployee.select";

export const TimeKeepingSelectBasic: FindOptionsSelect<TimeKeeping> = {
  id: true,
  type: true,
  orderEmployeeId: true,
  employeeId: true,
  timeAt: true,
  startTime: true,
  endTime: true,
  totalHours: true,
  salary: true,
  advanceSalaryId: true,
  marginId: true,
  referrerOrderId: true,
  otherAmount: true,
  otherAmountType: true,
  isPaid: true,
  isCollected: true,
  referralAppliedDate: true,
  referralEmployeeId: true,
  isRevenueShareAllocation: true,
  revenueShareStartDate: true,
  revenueShareEndDate: true,
  allocateRevenueId: true,
  note: true,
};

export const TimeKeepingSelectFull: FindOptionsSelect<TimeKeeping> = {
  ...TimeKeepingSelectBasic,
  employee: EmployeeSelectLite,
  orderEmployee: OrderEmployeeSelectBasic,
};

export const TimeKeepingRelations: FindOptionsRelations<TimeKeeping> = {
  employee: true,
  orderEmployee: true,
};
