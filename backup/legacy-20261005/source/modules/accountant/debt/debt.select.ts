import { Debt } from "@/database/models/Debt";
import { CustomerSelectLite } from "@/modules/customer/customer.select";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const DebtSelectBasic: FindOptionsSelect<Debt> = {
  id: true,
  code: true,
  type: true,
  amount: true,
  customerId: true,
  orderId: true,
  financeId: true,
  timeAt: true,
  note: true,
};

export const DebtSelectFull: FindOptionsSelect<Debt> = {
  ...DebtSelectBasic,
  customer: CustomerSelectLite,
};

export const DebtRelations: FindOptionsRelations<Debt> = {
  customer: true,
};
