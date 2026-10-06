import { TimeKeepingConfirm } from "@/database/models/TimeKeepingConfirm";
import { EmployeeSelectLite } from "@/modules/employee/employee.select";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { TimeKeepingSelectBasic } from "../timeKeeping.select";

export const TimeKeepingConfirmSelectBasic: FindOptionsSelect<TimeKeepingConfirm> = {
  id: true,
  employeeId: true,
  startAt: true,
  endAt: true,
  userId: true,
  totalHours: true,
  totalDayWorked: true,
  totalSalary: true,
  totalRealSalary: true,
  totalAdvance: true,
  totalMargin: true,
  totalUniform: true,
  totalPenalty: true,
  totalBonus: true,
  timeAt: true,
  note: true,
  isPaid: true,
};

export const TimeKeepingConfirmSelectFull: FindOptionsSelect<TimeKeepingConfirm> = {
  ...TimeKeepingConfirmSelectBasic,
  employee: EmployeeSelectLite,
  timeKeepings: TimeKeepingSelectBasic,
};

export const TimeKeepingConfirmSelectList: FindOptionsSelect<TimeKeepingConfirm> = {
  ...TimeKeepingConfirmSelectBasic,
  employee: EmployeeSelectLite,
};

export const TimeKeepingConfirmRelations: FindOptionsRelations<TimeKeepingConfirm> = {
  employee: true,
  timeKeepings: true,
};

export const TimeKeepingConfirmRelationsForList: FindOptionsRelations<TimeKeepingConfirm> = {
  employee: true,
};
