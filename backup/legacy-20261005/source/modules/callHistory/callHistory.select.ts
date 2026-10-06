import { CallHistory } from "@/database/models/CallHistory";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { EmployeeSelectLite } from "../employee/employee.select";
import { UserSelectBasic } from "../user/user.select";
import { OrderSelectLite } from "../order/order.select";

export const CallHistorySelectBasic: FindOptionsSelect<CallHistory> = {
  id: true,
  startTime: true,
  endTime: true,
  duration: true,
  answerDuration: true,
  endCallCause: true,
  endedBy: true,
  callType: true,
  callerPhoneNumber: true,
  receiverPhoneNumber: true,
  callerId: true,
  receiverId: true,
  orderId: true,
  callId: true,
  recordingUrl: true,
  note: true,
};

export const CallHistorySelectFull: FindOptionsSelect<CallHistory> = {
  ...CallHistorySelectBasic,
  caller: {
    ...UserSelectBasic,
    employee: EmployeeSelectLite,
  },
  receiver: {
    ...UserSelectBasic,
    employee: EmployeeSelectLite,
  },
  order: OrderSelectLite,
};

export const CallHistoryRelations: FindOptionsRelations<CallHistory> = {
  caller: {
    employee: true,
  },
  receiver: {
    employee: true,
  },
  order: true,
};
