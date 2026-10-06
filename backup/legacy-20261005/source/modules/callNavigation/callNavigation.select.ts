import { CallNavigation } from "@/database/models/CallNavigation";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";
import { CustomerSelectBasic } from "../customer/customer.select";
import { UserSelectBasic } from "../user/user.select";

export const CallNavigationSelectBasic: FindOptionsSelect<CallNavigation> = {
  id: true,
  customerId: true,
  employeePhone: true,
  phone: true,
  stringeePhone: true,
  userId: true,
  orderId: true,
  priority: true,
  expiresAt: true,
  callId: true,
  note: true,
};

export const CallNavigationSelectFull: FindOptionsSelect<CallNavigation> = {
  ...CallNavigationSelectBasic,
  createdAt: true,
  updatedAt: true,
  customer: CustomerSelectBasic,
  user: UserSelectBasic,
};

export const CallNavigationRelations: FindOptionsRelations<CallNavigation> = {
  user: true,
  customer: true,
};
