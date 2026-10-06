import { Vouchers } from "@/database/models/Vouchers";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const VouchersSelectBasic: FindOptionsSelect<Vouchers> = {
  id: true,
  userId: true,
  customerId: true,
  vouchersTemplateId: true,
  code: true,
  redeemedAt: true,
  expiredAt: true,
  isUsed: true,
  usedAt: true,
  note: true,
  createdAt: true,
  updatedAt: true,
  vouchersTemplate: {
    id: true,
    name: true,
    code: true,
    points: true,
    amount: true,
    status: true,
  },
};

export const VouchersSelectFull: FindOptionsSelect<Vouchers> = {
  ...VouchersSelectBasic,
  customer: {
    id: true,
    code: true,
    name: true,
    phone: true,
  },
  user: {
    id: true,
    username: true,
    name: true,
    phone: true,
  },
};

export const VouchersRelations: FindOptionsRelations<Vouchers> = {
  vouchersTemplate: true,
  customer: true,
  user: true,
};
