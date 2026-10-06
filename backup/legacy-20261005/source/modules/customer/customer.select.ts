import { Customer } from "@/database/models/Customer";
import { FindOptionsRelations, FindOptionsSelect } from "typeorm";

export const CustomerSelectLite: FindOptionsSelect<Customer> = {
  id: true,
  code: true,
  name: true,
  zaloName: true,
  phone: true,
  avatar: true,
  address: true,
};

export const CustomerSelectBasic: FindOptionsSelect<Customer> = {
  ...CustomerSelectLite,
  customName: true,
  email: true,
  source: true,
  dob: true,
  gender: true,
  taxCode: true,
  businessCode: true,
  referralCode: true,
  openingDebt: true,
  note: true,
};

export const CustomerSelectFull: FindOptionsSelect<Customer> = {
  ...CustomerSelectBasic,
};

export const CustomerRelations: FindOptionsRelations<Customer> = {};
